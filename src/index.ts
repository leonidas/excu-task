import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const docClient = new DynamoDB.DocumentClient({
  region: "eu-north-1",
});

/**
 * GET handler, fetches all data for a partition key provided in lambda path parameters
 */
export const apiGetHandler = async (
  event: APIGatewayProxyEvent,
  _ctx: Context
): Promise<APIGatewayProxyResult> => {
  const name = event.pathParameters?.name;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Path parameter not provided",
      }),
    };
  }

  const { Items } = await docClient
    .query({
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": name,
      },
    })
    .promise();

  console.log(Items);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: Items,
    }),
  };
};

/**
 * POST handler, puts a new item to dynamodb
 * partition key provided in path parameters, additional fields in body
 */
export const apiPostHandler = async (
  event: APIGatewayProxyEvent,
  _ctx: Context
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");
  const name = event.pathParameters?.name;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Path parameter not provided",
      }),
    };
  }

  await docClient
    .put({
      TableName: process.env.TABLE_NAME!,
      Item: {
        ...body,
        PK: name,
        SK: new Date().toISOString(),
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `OK`,
    }),
  };
};
