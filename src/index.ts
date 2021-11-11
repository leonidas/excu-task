import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { putItem, queryItem } from "./dynamo";

/**
 */
export const apiGetHandler = async (
  event: APIGatewayProxyEvent,
  _ctx: Context
): Promise<APIGatewayProxyResult> => {
  console.log(event.pathParameters);
  const name = event.pathParameters!.name!;
  const items = await queryItem(name);

  console.log(items);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: items,
    }),
  };
};

export const apiPostHandler = async (
  event: APIGatewayProxyEvent,
  _ctx: Context
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const name = event.pathParameters!.name!;

  await putItem(name, new Date().toISOString(), body);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `OK`,
    }),
  };
};
