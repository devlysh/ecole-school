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

export class EcoleSchoolInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC for RDS
    const vpc = new ec2.Vpc(this, "EcoleSchoolVpc", {
      maxAzs: 2,
    });

    // 2. RDS Instance for PostgreSQL
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
      publiclyAccessible: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Security Group for RDS instance with limited access
    const dbSecurityGroup = new ec2.SecurityGroup(this, "DBSecurityGroup", {
      vpc,
    });
    dbInstance.connections.allowFrom(
      dbSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow App Runner access to PostgreSQL"
    );

    // 4. Docker Image Asset
    const dockerImageAsset = new ecr_assets.DockerImageAsset(
      this,
      "EcoleSchoolApp",
      {
        directory: "../../",
        platform: ecr_assets.Platform.LINUX_AMD64,
      }
    );

    // 5. IAM role for App Runner to pull images from ECR
    const accessRole = new iam.Role(this, "EcoleSchoolAppRunnerAccessRole", {
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    });
    dockerImageAsset.repository.grantPull(accessRole);

    // 6. IAM role for App Runner service tasks to access AWS resources
    const instanceRole = new iam.Role(
      this,
      "EcoleSchoolAppRunnerInstanceRole",
      {
        assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
      }
    );

    // Grant instance role read access to the database secret
    dbCredentialsSecret.grantRead(instanceRole);

    // 7. VPC Connector for App Runner
    const vpcConnector = new apprunner.VpcConnector(
      this,
      "AppRunnerVpcConnector",
      {
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        securityGroups: [dbSecurityGroup],
      }
    );

    // Construct DATABASE_URL from secret values and RDS instance details
    const databaseUrl = `postgresql://${dbCredentialsSecret
      .secretValueFromJson("username")
      .unsafeUnwrap()}:${dbCredentialsSecret
      .secretValueFromJson("password")
      .unsafeUnwrap()}@${dbInstance.instanceEndpoint.hostname}:5432/${dbInstance.instanceIdentifier}`;

    // Create a custom observability configuration
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

    // 8. App Runner service configuration with VPC connector
    const service = new apprunner.Service(this, "EcoleSchoolAppRunnerService", {
      source: apprunner.Source.fromAsset({
        imageConfiguration: {
          port: 3000,
          environmentVariables: {
            DATABASE_URL: databaseUrl,
            NODE_OPTIONS: '--trace-warnings',
            DEBUG: '*',
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

    // Enable CloudWatch logs for the App Runner service
    const cfnService = service.node.defaultChild as CfnService;
    cfnService.healthCheckConfiguration = {
      protocol: apprunner.HealthCheckProtocolType.TCP,
    };
    cfnService.observabilityConfiguration = {
      observabilityConfigurationArn:
        observabilityConfig.attrObservabilityConfigurationArn,
      observabilityEnabled: true,
    };

    // After creating the App Runner service
    const logGroupName = `/aws/apprunner/${service.serviceName}/${service.serviceId}`;

    // Output the log group name
    new cdk.CfnOutput(this, "EcoleSchoolAppRunnerLogGroup", {
      value: logGroupName,
      description: "The CloudWatch Log Group for the App Runner service",
    });

    // 9. Output the App Runner service URL
    new cdk.CfnOutput(this, "EcoleSchoolAppRunnerServiceUrl", {
      value: service.serviceUrl,
      description: "The URL of the App Runner service",
    });
  }
}
