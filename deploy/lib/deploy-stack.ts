import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { PolicyDocument, PolicyStatement } from "@aws-cdk/aws-iam";

const EXCU_DYNAMO_TABLE_NAME = "ExcuTable";
const EXCU_DYNAMO_TABLE_ARN =
  "arn:aws:dynamodb:eu-north-1:886218730506:table/ExcuTable";
const namePrefix = "TEST";

export class DeployStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, "ExcuLambdaRole", {
      roleName: `${namePrefix}-excu-lambda-role`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        DynamoAccess: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                // "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                // "dynamodb:PutItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                // "dynamodb:UpdateItem",
                // "dynamodb:BatchWriteItem",
                "dynamodb:DescribeTable",
              ],
              resources: [EXCU_DYNAMO_TABLE_ARN],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    // api lambda
    const apiLambda = new lambda.Function(this, "ExcuApiLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "index.apiHandler",
      functionName: `${namePrefix}-excu-task-api`,
      timeout: cdk.Duration.seconds(90),
      role: lambdaRole,
      environment: {
        TABLE_NAME: EXCU_DYNAMO_TABLE_NAME,
      },
    });

    // staticHandler
    const staticLambda = new lambda.Function(this, "ExcuStaticLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "index.staticHandler",
      functionName: `${namePrefix}-excu-task-static`,
      timeout: cdk.Duration.seconds(90),
    });

    const api = new apigateway.RestApi(this, "ExcuApi", {
      restApiName: `${namePrefix}-ExcuApi`,
    });
    const apiIntegration = new apigateway.LambdaIntegration(apiLambda, {});
    const apiPath = api.root.addResource("api");
    apiPath.addMethod("GET", apiIntegration);

    const staticIntegration = new apigateway.LambdaIntegration(
      staticLambda,
      {}
    );
    const staticPath = api.root.addResource("static");
    staticPath.addMethod("GET", staticIntegration);
  }
}
