import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class AwsDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ TASK 1: Hello World CDK Stack
    // This demonstrates basic CDK concepts: Stacks, Constructs, and App
    
    // Lambda function in Python
    const helloLambda = new lambda.Function(this, 'HelloLambdaFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'app.handler',
      code: lambda.Code.fromAsset('lambda_py'),
    });

    // 🏷️ Add tags to all resources in this stack
    cdk.Tags.of(this).add('Owner', 'Drashti');
    cdk.Tags.of(this).add('Project', 'AWS-Demo');
    cdk.Tags.of(this).add('Environment', 'Development');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');

    new cdk.CfnOutput(this, 'HelloLambdaFunctionName', {
        value: helloLambda.functionName,
        description: 'The name of the Hello Lambda function',
    });

    // Add a CloudFormation output - our "Hello World"
    new cdk.CfnOutput(this, 'HelloWorldOutput', {
      value: 'Hello from AWS CDK with TypeScript! 🚀',
      description: 'My first CDK output',
      exportName: 'HelloWorldMessage',
    });

    // Output the stack name
    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'The name of this stack',
    });

    // Output the region and account
    new cdk.CfnOutput(this, 'DeploymentInfo', {
      value: `Stack deployed in region ${this.region} on account ${this.account}`,
      description: 'Deployment information',
    });
  }
}
