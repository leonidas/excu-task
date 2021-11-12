# excu-task

~~Task for student excursions~~
Small demo of CDK, dynamodb and lambdas for student excursions. The stack has a dynamodb table, and a small web api to post and get items from the table

[deploy/lib/deploy-stack.ts](deploy/lib/deploy-stack.ts)

- The definition of the CDK stack, contains all the infrastructure of this stack

[src/index.ts](src/index.ts)

- The lambda code, contains handlers for two lambdas

## CDK

CDK is an AWS's IAC (infrastructure as code) tool.
It allows you to write your infra definitions as code, and contains helpoful structures and functions that speed up the development.

For example the stack in this repositroy can be very simply deployd just by running `cdk deploy` in `deploy` directory. After it's deployed, it can be destroyd by running `cdk destroy`.

More info [here](https://docs.aws.amazon.com/cdk/latest/guide/home.html)

## DynamoDB

DynamoDB is AWS's serverless NoSQL database, which can handle huge amounts of data.

Very much simplified it works as follows

- A table always has a Partition key (called PK in this repo). Partition key can be used to efficiently query items from the table. Work similarly as primary keys in SQL, except in dynamodb, the partition key does not have to be unique.
- The table can also have a sort key. Sort key is used for distinction between items with the same partition key. In this example it is an ISO timestamp.
- Querying by other attributes besides partition key can be done, but requires a full table scan which is always very inefficient (and possibly expensive in money as well). This means that the table data structure should always be carefully thought out beforehand.

## Lambda

Lambdas are AWS's serverless functions. It is simply a function (typescript function in this case) in the cloud, that you can call in various ways. This example attaches a API gateway api to the function, so that it can be called over the internet with a URL.

## TODO deploy instructions
