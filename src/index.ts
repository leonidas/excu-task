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
 */
export const apiGetHandler = async (
  event: APIGatewayProxyEvent,
  _ctx: Context
): Promise<APIGatewayProxyResult> => {
  console.log(event.pathParameters);
  const name = event.pathParameters!.name!;

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

export const apiPostHandler = async (
  event: APIGatewayProxyEvent,
  _ctx: Context
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const name = event.pathParameters!.name!;

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
