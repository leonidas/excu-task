import { APIGatewayProxyEvent, Context } from "aws-lambda";

export const staticHandler = (event: APIGatewayProxyEvent, _ctx: Context) => {
  event.body;

  return {
    statusCode: 200,
    body: "<html><body><h1>TEST JEE</h1></body></html>",
  };
};

export const apiHandler = (event: APIGatewayProxyEvent, _ctx: Context) => {
  event.body;

  return {
    statusCode: 200,
    body: "jee",
  };
};
