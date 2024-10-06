import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";

export class EcoleSchoolInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Build Docker image
    const dockerImageAsset = new ecr_assets.DockerImageAsset(
      this,
      "EcoleSchoolApp",
      {
        directory: "../", // Adjust the path if necessary
        platform: ecr_assets.Platform.LINUX_AMD64,
      }
    );

    // 2. Create an IAM role for App Runner to pull images from ECR
    const accessRole = new iam.Role(this, "EcoleSchoolAppRunnerAccessRole", {
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    });
    dockerImageAsset.repository.grantPull(accessRole);

    // 3. Create an IAM role for App Runner service tasks to access AWS resources
    const instanceRole = new iam.Role(
      this,
      "EcoleSchoolAppRunnerInstanceRole",
      {
        assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
      }
    );

    // 4. Define App Runner service
    const service = new apprunner.Service(this, "EcoleSchoolAppRunnerService", {
      source: apprunner.Source.fromAsset({
        imageConfiguration: {
          port: 3000, // Adjust if necessary
        },
        asset: dockerImageAsset,
      }),
      accessRole: accessRole,
      instanceRole: instanceRole,
    });

    // 5. Output the App Runner service URL
    new cdk.CfnOutput(this, "EcoleSchoolAppRunnerServiceUrl", {
      value: service.serviceUrl,
      description: "The URL of the App Runner service",
    });
  }
}
