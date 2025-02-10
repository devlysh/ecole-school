import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";
import {
  CfnService,
  CfnObservabilityConfiguration,
} from "aws-cdk-lib/aws-apprunner";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

export class EcoleSchoolInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for RDS
    const vpc = new ec2.Vpc(this, "EcoleSchoolVpc", {
      maxAzs: 2,
    });

    // RDS Instance for PostgreSQL
    const dbCredentialsSecret = new secretsmanager.Secret(
      this,
      "DBCredentialsSecret",
      {
        secretName: "EcoleSchoolPostgresCredentials",
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: "postgres",
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: "password",
        },
      }
    );

    const dbSecurityGroup = new ec2.SecurityGroup(this, "DBSecurityGroup", {
      vpc,
      description: "Security group for PostgreSQL RDS instance",
    });

    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4("0.0.0.0/0"),
      ec2.Port.tcp(5432),
      "Allow PostgreSQL from local IP"
    );

    const dbInstance = new rds.DatabaseInstance(this, "EcoleSchoolPostgres", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13,
      }),
      vpc,
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MEDIUM
      ),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      securityGroups: [dbSecurityGroup],
    });

    // Docker Image Asset
    const dockerImageAsset = new ecr_assets.DockerImageAsset(
      this,
      "EcoleSchoolApp",
      {
        directory: "../../",
        platform: ecr_assets.Platform.LINUX_AMD64,
      }
    );

    // IAM Roles
    const accessRole = new iam.Role(this, "EcoleSchoolAppRunnerAccessRole", {
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    });
    dockerImageAsset.repository.grantPull(accessRole);

    const instanceRole = new iam.Role(
      this,
      "EcoleSchoolAppRunnerInstanceRole",
      {
        assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
      }
    );
    dbCredentialsSecret.grantRead(instanceRole);

    // VPC Connector for App Runner
    const vpcConnector = new apprunner.VpcConnector(
      this,
      "AppRunnerVpcConnector",
      {
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        securityGroups: [dbSecurityGroup],
      }
    );

    // Construct DATABASE_URL
    const databaseUrl = `postgresql://${dbCredentialsSecret
      .secretValueFromJson("username")
      .unsafeUnwrap()}:${dbCredentialsSecret
      .secretValueFromJson("password")
      .unsafeUnwrap()}@${dbInstance.instanceEndpoint.hostname}:5432/${dbInstance.instanceIdentifier}`;

    // Observability Configuration
    const observabilityConfig = new CfnObservabilityConfiguration(
      this,
      "AppRunnerObservabilityConfig",
      {
        observabilityConfigurationName: "EcoleSchoolObservabilityConfig",
        traceConfiguration: {
          vendor: "AWSXRAY",
        },
      }
    );

    // App Runner Service
    const service = new apprunner.Service(this, "EcoleSchoolAppRunnerService", {
      source: apprunner.Source.fromAsset({
        imageConfiguration: {
          port: 3000,
          environmentVariables: {
            DATABASE_URL: databaseUrl,
            NODE_OPTIONS: "--trace-warnings",
            DEBUG: "*",
          },
        },
        asset: dockerImageAsset,
      }),
      accessRole: accessRole,
      instanceRole: instanceRole,
      vpcConnector: vpcConnector,
      cpu: apprunner.Cpu.ONE_VCPU,
      memory: apprunner.Memory.TWO_GB,
    });

    const cfnService = service.node.defaultChild as CfnService;
    cfnService.healthCheckConfiguration = {
      protocol: apprunner.HealthCheckProtocolType.TCP,
    };
    cfnService.observabilityConfiguration = {
      observabilityConfigurationArn:
        observabilityConfig.attrObservabilityConfigurationArn,
      observabilityEnabled: true,
    };

    // Lambda Function for Refreshing Booked Classes
    const refreshBookedClassesLambda = new lambda.Function(
      this,
      "RefreshBookedClassesLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "lambda/refresh-booked-classes.handler",
        code: lambda.Code.fromAsset("dist"),
        vpc: vpc,
        securityGroups: [dbSecurityGroup],
        environment: {
          DATABASE_URL: databaseUrl,
        },
      }
    );

    dbCredentialsSecret.grantRead(refreshBookedClassesLambda);

    // EventBridge Rule for Lambda
    const rule = new events.Rule(this, "HourlyRefreshRule", {
      schedule: events.Schedule.expression("cron(0 * * * ? *)"),
    });

    rule.addTarget(new targets.LambdaFunction(refreshBookedClassesLambda));

    // Outputs
    const logGroupName = `/aws/apprunner/${service.serviceName}/${service.serviceId}`;
    new cdk.CfnOutput(this, "EcoleSchoolAppRunnerLogGroup", {
      value: logGroupName,
      description: "The CloudWatch Log Group for the App Runner service",
    });

    new cdk.CfnOutput(this, "EcoleSchoolAppRunnerServiceUrl", {
      value: service.serviceUrl,
      description: "The URL of the App Runner service",
    });

    new cdk.CfnOutput(this, "RdsEndpoint", {
      value: dbInstance.instanceEndpoint.hostname,
      description: "RDS Endpoint to connect with PgAdmin",
    });
  }
}
