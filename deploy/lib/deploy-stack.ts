import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigateway";

import { PolicyStatement } from "@aws-cdk/aws-iam";

// const EXCU_DYNAMO_TABLE_NAME = "ExcuTable";
// const EXCU_DYNAMO_TABLE_ARN =
//   "arn:aws:dynamodb:eu-north-1:886218730506:table/ExcuTable";
const namePrefix = "TEST";

export class DeployStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "excutable", {
      tableName: "excutable",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
    });

    // api lambda
    const apiGetLambda = new lambda.Function(this, "ExcuApiGetLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "index.apiGetHandler",
      functionName: `${namePrefix}-excu-task-api-get`,
      timeout: cdk.Duration.seconds(90),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const apiPostLambda = new lambda.Function(this, "ExcuApiPostLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "index.apiPostHandler",
      functionName: `${namePrefix}-excu-task-api-post`,
      timeout: cdk.Duration.seconds(90),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const dynamoPolicy = new PolicyStatement({
      actions: [
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "dynamodb:DescribeTable",
      ],
      resources: [table.tableArn],
      effect: iam.Effect.ALLOW,
    });

    apiGetLambda.addToRolePolicy(dynamoPolicy);
    apiPostLambda.addToRolePolicy(dynamoPolicy);

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
    const getIntegration = new apigateway.LambdaIntegration(apiGetLambda, {});
    const postIntegration = new apigateway.LambdaIntegration(apiPostLambda, {});
    const apiPath = api.root.addResource("api");
    const proxyPath = apiPath.addResource("{name}");
    proxyPath.addMethod("GET", getIntegration);
    proxyPath.addMethod("POST", postIntegration);

    const staticIntegration = new apigateway.LambdaIntegration(
      staticLambda,
      {}
    );
    const staticPath = api.root.addResource("static");
    staticPath.addMethod("GET", staticIntegration, {});
  }
}
