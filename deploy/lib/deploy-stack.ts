import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigateway";

export class DeployStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dynamodb table with string partition key and string sort key
    const table = new dynamodb.Table(this, "excutable", {
      tableName: "excutable",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
    });

    // api lambdas
    const apiGetLambda = new lambda.Function(this, "ExcuApiGetLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist/src"),
      handler: "index.apiGetHandler",
      functionName: `excu-task-api-get`,
      timeout: cdk.Duration.seconds(90),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const apiPostLambda = new lambda.Function(this, "ExcuApiPostLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist/src"),
      handler: "index.apiPostHandler",
      functionName: `excu-task-api-post`,
      timeout: cdk.Duration.seconds(90),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Give the lambdas permission to read and write stuff to the dynamo table
    table.grantReadData(apiGetLambda);
    table.grantWriteData(apiPostLambda);

    // Apigateway API
    const api = new apigateway.RestApi(this, "ExcuApi", {
      restApiName: `ExcuApi`,
    });

    // Path prefix of the lambda url
    const apiPath = api.root.addResource("api");
    // This is for the path parameter
    const proxyPath = apiPath.addResource("{name}");

    // the get lambda will respond at GET {apigw url}/api/{your path param}
    const getIntegration = new apigateway.LambdaIntegration(apiGetLambda, {});
    proxyPath.addMethod("GET", getIntegration);

    // POST handler to the same url
    const postIntegration = new apigateway.LambdaIntegration(apiPostLambda, {});
    proxyPath.addMethod("POST", postIntegration);

    new cdk.CfnOutput(this, "ExampleGetCall", {
      value: `curl ${api.url}api/examplePathParam`,
    });
    new cdk.CfnOutput(this, "ExamplePostCall", {
      value: `curl -X POST ${api.url}api/examplePathParam -d "{\\"message\\":\\"example message\\"}"`,
    });
  }
}
