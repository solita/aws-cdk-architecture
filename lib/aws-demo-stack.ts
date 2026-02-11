import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class AwsDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ TASK 1: Hello World CDK Stack
    // This demonstrates basic CDK concepts: Stacks, Constructs, and App

    const alarmSNS = new sns.Topic(this, 'AlarmSNSTopic', {
      displayName: 'AWS demo Alarms',
      topicName: 'aws-alarms',
    });

    alarmSNS.addSubscription(new subscriptions.EmailSubscription('drashti.jasani@solita.fi'));
    
    // Lambda function in Python
    const helloLambda = new lambda.Function(this, 'HelloLambdaFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'app.handler',
      code: lambda.Code.fromAsset('lambda_py'),
      logRetention: logs.RetentionDays.ONE_WEEK,
      timeout: cdk.Duration.seconds(30),
    });

   const api = new apigw.RestApi(this, 'DemoApi', {
    restApiName: 'DemoService',
    description: 'This service serves a simple demo api gateway message.',
    deployOptions: {
      metricsEnabled: true, // Keep metrics for CloudWatch alarms
    },
    });

    const itemsTable = new dynamodb.Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'Items',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // DESTROY is NOT recommended for production code
    });
    itemsTable.grantReadWriteData(helloLambda);
    helloLambda.addEnvironment('TABLE_NAME', itemsTable.tableName);

    const lambdaIntegration = new apigw.LambdaIntegration(helloLambda);
    api.root.addMethod('GET', lambdaIntegration); // GET
    api.root.addMethod('POST', lambdaIntegration); // POST

    // Alarm: Lambda Errors
    const lambdaErrorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      metric: helloLambda.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1, // Alert if ANY error occurs
      evaluationPeriods: 1,
      alarmDescription: 'Alert when Lambda function has errors',
      alarmName: 'DemoApp-Lambda-Errors',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    lambdaErrorAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // Alarm: Lambda Throttles
    const lambdaThrottleAlarm = new cloudwatch.Alarm(this, 'LambdaThrottleAlarm', {
      metric: helloLambda.metricThrottles({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: 'Alert when Lambda is throttled (hitting concurrency limits)',
      alarmName: 'DemoApp-Lambda-Throttles',
    });
    lambdaThrottleAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // Alarm: API Gateway 5xx Errors
    const api5xxAlarm = new cloudwatch.Alarm(this, 'Api5xxAlarm', {
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 5, // Alert if 5 server errors in 5 minutes
      evaluationPeriods: 1,
      alarmDescription: 'Alert on API Gateway 5xx errors',
      alarmName: 'DemoApp-API-5xx-Errors',
    });
    api5xxAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // Alarm: API Gateway High Latency
    const apiLatencyAlarm = new cloudwatch.Alarm(this, 'ApiLatencyAlarm', {
      metric: api.metricLatency({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 1000, // Alert if average latency > 1 second
      evaluationPeriods: 2,
      alarmDescription: 'Alert when API latency is high',
      alarmName: 'DemoApp-API-High-Latency',
    });
    apiLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // 🏷️ Add tags to all resources in this stack
    cdk.Tags.of(this).add('Owner', 'DrashtiJaasani');
    cdk.Tags.of(this).add('Project', 'AWS-Demo');
    cdk.Tags.of(this).add('Environment', 'Development');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url ?? 'Something went wrong with the deploy',
      description: 'The URL of the API Gateway endpoint',
    });

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
