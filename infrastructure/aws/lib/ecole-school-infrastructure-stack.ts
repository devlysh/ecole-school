import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as cognito from "aws-cdk-lib/aws-cognito";

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

    const dbSecurityGroup = new ec2.SecurityGroup(this, "DBSecurityGroup", {
      vpc,
      allowAllOutbound: true,
    });
    dbInstance.connections.allowFrom(
      dbSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow App Runner access to PostgreSQL"
    );

    dbInstance.connections.allowFromAnyIpv4(
      ec2.Port.tcp(5432),
      "Allow App Runner access to PostgreSQL"
    );

    // 3. Cognito User Pool
    const userPool = new cognito.UserPool(this, "EcoleSchoolUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: true,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      "EcoleSchoolUserPoolClient",
      {
        userPool,
        authFlows: { userPassword: true, userSrp: true },
      }
    );

    // Cognito Groups for roles
    const adminGroup = new cognito.CfnUserPoolGroup(this, "AdminGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "admin",
      description: "Admin users with full access",
      precedence: 1,
    });

    const teacherGroup = new cognito.CfnUserPoolGroup(this, "TeacherGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "teacher",
      description: "Teacher users with teaching privileges",
      precedence: 2,
    });

    const studentGroup = new cognito.CfnUserPoolGroup(this, "StudentGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "student",
      description: "Student users with learning privileges",
      precedence: 3,
    });

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

    // 7. App Runner service configuration without DATABASE_URL
    const service = new apprunner.Service(this, "EcoleSchoolAppRunnerService", {
      source: apprunner.Source.fromAsset({
        imageConfiguration: {
          port: 3000,
          environmentVariables: {
            DATABASE_URL: `postgresql://${dbCredentialsSecret
              .secretValueFromJson("username")
              .unsafeUnwrap()}:${dbCredentialsSecret.secretValueFromJson("password").unsafeUnwrap()}@${
              dbInstance.instanceEndpoint.hostname
            }:5432/${dbInstance.instanceIdentifier}`,
            COGNITO_USER_POOL_ID: userPool.userPoolId,
            COGNITO_USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
          },
        },
        asset: dockerImageAsset,
      }),
      accessRole: accessRole,
      instanceRole: instanceRole,
    });

    // 8. Output the App Runner service URL and Cognito details
    new cdk.CfnOutput(this, "EcoleSchoolAppRunnerServiceUrl", {
      value: service.serviceUrl,
      description: "The URL of the App Runner service",
    });
    new cdk.CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
      description: "The Cognito User Pool ID",
    });
    new cdk.CfnOutput(this, "CognitoUserPoolClientId", {
      value: userPoolClient.userPoolClientId,
      description: "The Cognito User Pool Client ID",
    });
    new cdk.CfnOutput(this, "AdminGroupName", {
      value: adminGroup.groupName!,
      description: "The Cognito Admin Group",
    });
    new cdk.CfnOutput(this, "TeacherGroupName", {
      value: teacherGroup.groupName!,
      description: "The Cognito Teacher Group",
    });
    new cdk.CfnOutput(this, "StudentGroupName", {
      value: studentGroup.groupName!,
      description: "The Cognito Student Group",
    });
  }
}
