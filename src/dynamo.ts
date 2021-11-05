import { DynamoDB } from "aws-sdk";

const docClient = new DynamoDB.DocumentClient({
  region: "eu-north-1",
});

export const queryItem = async (primaryKey: string) => {
  const { Items } = await docClient
    .query({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK: :pk",
      ExpressionAttributeValues: {
        ":pk": primaryKey,
      },
    })
    .promise();
  return Items;
};

// export const putItem = async (primaryKey: string, body: any) => {
//   return docClient
//     .put({
//       TableName: process.env.TABLE_NAME,
//       Item: {
//         ...body,
//         PK: primaryKey,
//       },
//     })
//     .promise();
// };
