// AWS Lambda Handler - This is the function that AWS will execute

// Import types from AWS Lambda (these tell TypeScript what shape the data has)
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * Lambda Handler Function
 * 
 * @param event - Contains information about the request (like HTTP request data)
 * @param context - Contains information about the Lambda execution environment
 * @returns Response object with statusCode, headers, and body
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  
  // Log the incoming event (you'll see this in CloudWatch Logs)
  console.log('Event received:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  // Create a response object
  const response: APIGatewayProxyResult = {
    statusCode: 200,  // HTTP status code (200 = success)
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'  // CORS header (allows browser requests)
    },
    body: JSON.stringify({
      message: 'Hello World from AWS Lambda! 🚀',
      timestamp: new Date().toISOString(),
      requestId: context.awsRequestId,
      functionName: context.functionName,
      region: process.env.AWS_REGION
    })
  };

  return response;
};