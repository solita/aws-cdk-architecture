import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as budgets from "aws-cdk-lib/aws-budgets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class AwsDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ TASK 1: Hello World CDK Stack
    // This demonstrates basic CDK concepts: Stacks, Constructs, and App

    const alarmSNS = new sns.Topic(this, "AlarmSNSTopic", {
      displayName: "AWS demo Alarms",
      topicName: "aws-alarms",
    });

    alarmSNS.addSubscription(
      new subscriptions.EmailSubscription("drashti.jasani@solita.fi"),
    );

    // Lambda function for listing items
    const listItemsLambda = new lambda.Function(this, "ListItemsFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "list_items.handler",
      code: lambda.Code.fromAsset("lambda_py"),
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: cdk.Duration.seconds(10),
      description: "List all items from DynamoDB",
    });

    // Lambda function for creating items
    const createItemLambda = new lambda.Function(this, "CreateItemFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "create_item.handler",
      code: lambda.Code.fromAsset("lambda_py"),
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: cdk.Duration.seconds(10),
      description: "Create new item in DynamoDB",
    });

    // Lambda function for secrets test
    const secretsTestLambda = new lambda.Function(this, "SecretsTestFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "secrets_test.handler",
      code: lambda.Code.fromAsset("lambda_py"),
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: cdk.Duration.seconds(10),
      description: "Test retrieval of secrets from Secrets Manager",
    });

    const api = new apigw.RestApi(this, "DemoApi", {
      restApiName: "DemoService",
      description: "This service serves a simple demo api gateway message.",
      deployOptions: {
        metricsEnabled: true, // Keep metrics for CloudWatch alarms
      },
    });

    // Create a secret for API key
    const apiKeySecret = new secretsmanager.Secret(this, "DemoApiKeySecret", {
      secretName: "demo/api-key",
      description: "API key for external service integration",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "demo-user" }),
        generateStringKey: "api_key",
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    // Create database credentials secret
    const dbCredentials = new secretsmanager.Secret(this, "DemoDbCredentials", {
      secretName: "demo/db-credentials",
      description: "Database credentials for demo application",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: "demoUser",
          database: "Items",
        }),
        generateStringKey: "password",
        excludePunctuation: true,
        passwordLength: 20,
      },
    });

    const itemsTable = new dynamodb.Table(this, "ItemsTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: "Items",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // DESTROY is NOT recommended for production code
    });

    // Grant DynamoDB permissions to list and create functions only
    itemsTable.grantReadData(listItemsLambda);
    listItemsLambda.addEnvironment("TABLE_NAME", itemsTable.tableName);

    itemsTable.grantWriteData(createItemLambda);
    createItemLambda.addEnvironment("TABLE_NAME", itemsTable.tableName);

    // Grant secrets permissions to secrets test function only
    apiKeySecret.grantRead(secretsTestLambda);
    dbCredentials.grantRead(secretsTestLambda);
    secretsTestLambda.addEnvironment(
      "API_KEY_SECRET_ARN",
      apiKeySecret.secretArn,
    );
    secretsTestLambda.addEnvironment(
      "DB_CREDENTIALS_SECRET_ARN",
      dbCredentials.secretArn,
    );

    // API Gateway integrations - each endpoint to dedicated Lambda
    const listIntegration = new apigw.LambdaIntegration(listItemsLambda);
    const createIntegration = new apigw.LambdaIntegration(createItemLambda);
    const secretsIntegration = new apigw.LambdaIntegration(secretsTestLambda);

    api.root.addMethod("GET", listIntegration);
    api.root.addMethod("POST", createIntegration);

    const secretsTestResource = api.root.addResource("secrets-test");
    secretsTestResource.addMethod("GET", secretsIntegration);

    // Alarms for List Items Lambda
    new cloudwatch.Alarm(this, "ListItemsErrorAlarm", {
      metric: listItemsLambda.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: "Sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Alert when ListItems function has errors",
      alarmName: "DemoApp-ListItems-Errors",
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // Alarms for Create Item Lambda
    new cloudwatch.Alarm(this, "CreateItemErrorAlarm", {
      metric: createItemLambda.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: "Sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Alert when CreateItem function has errors",
      alarmName: "DemoApp-CreateItem-Errors",
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // Alarms for Secrets Test Lambda
    new cloudwatch.Alarm(this, "SecretsTestErrorAlarm", {
      metric: secretsTestLambda.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: "Sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Alert when SecretsTest function has errors",
      alarmName: "DemoApp-SecretsTest-Errors",
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // Alarm: API Gateway 5xx Errors
    const api5xxAlarm = new cloudwatch.Alarm(this, "Api5xxAlarm", {
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: "Sum",
      }),
      threshold: 5, // Alert if 5 server errors in 5 minutes
      evaluationPeriods: 1,
      alarmDescription: "Alert on API Gateway 5xx errors",
      alarmName: "DemoApp-API-5xx-Errors",
    });
    api5xxAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // Alarm: API Gateway High Latency
    const apiLatencyAlarm = new cloudwatch.Alarm(this, "ApiLatencyAlarm", {
      metric: api.metricLatency({
        period: cdk.Duration.minutes(5),
        statistic: "Average",
      }),
      threshold: 1000, // Alert if average latency > 1 second
      evaluationPeriods: 2,
      alarmDescription: "Alert when API latency is high",
      alarmName: "DemoApp-API-High-Latency",
    });
    apiLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmSNS));

    // AWS Budget
    new budgets.CfnBudget(this, "MonthlyBudget", {
      budget: {
        budgetName: "AWS-Demo-Monthly-Budget",
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: {
          amount: 10,
          unit: "USD",
        },
        costFilters: {
          TagKeyValue: [`user:Owner$DrashtiJaasani`],
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: "ACTUAL",
            comparisonOperator: "GREATER_THAN",
            threshold: 80,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            {
              subscriptionType: "EMAIL",
              address: "drashti.jasani@solita.fi",
            },
          ],
        },
        {
          notification: {
            notificationType: "FORECASTED",
            comparisonOperator: "GREATER_THAN",
            threshold: 100,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            {
              subscriptionType: "EMAIL",
              address: "drashti.jasani@solita.fi",
            },
          ],
        },
      ],
    });

    // // ========================================
    // // 🧪 TEST BUDGET - Will trigger immediately!
    // // ========================================
    // new budgets.CfnBudget(this, 'TestBudget', {
    //   budget: {
    //     budgetName: 'TEST-Budget-Alert',
    //     budgetType: 'COST',
    //     timeUnit: 'MONTHLY',
    //     budgetLimit: {
    //       amount: 0.01, // $0.01 - will trigger immediately
    //       unit: 'USD',
    //     },
    //     // No cost filters - tracks ALL spending in account
    //   },
    //   notificationsWithSubscribers: [
    //     {
    //       notification: {
    //         notificationType: 'ACTUAL',
    //         comparisonOperator: 'GREATER_THAN',
    //         threshold: 1, // Alert at just 1% of $0.01 (basically immediate)
    //         thresholdType: 'PERCENTAGE',
    //       },
    //       subscribers: [
    //         {
    //           subscriptionType: 'EMAIL',
    //           address: 'drashti.jasani@solita.fi',
    //         },
    //       ],
    //     },
    //   ],
    // });

    // 🏷️ Add tags to all resources in this stack
    cdk.Tags.of(this).add("Owner", "DrashtiJaasani");
    cdk.Tags.of(this).add("Project", "AWS-Demo");
    cdk.Tags.of(this).add("Environment", "Development");
    cdk.Tags.of(this).add("ManagedBy", "CDK");

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url ?? "Something went wrong with the deploy",
      description: "The URL of the API Gateway endpoint",
    });

    new cdk.CfnOutput(this, "ListItemsFunctionName", {
      value: listItemsLambda.functionName,
      description: "List Items Lambda function name",
    });

    new cdk.CfnOutput(this, "CreateItemFunctionName", {
      value: createItemLambda.functionName,
      description: "Create Item Lambda function name",
    });

    new cdk.CfnOutput(this, "SecretsTestFunctionName", {
      value: secretsTestLambda.functionName,
      description: "Secrets Test Lambda function name",
    });

    // Add a CloudFormation output - our "Hello World"
    new cdk.CfnOutput(this, "HelloWorldOutput", {
      value: "Hello from AWS CDK with TypeScript! 🚀",
      description: "My first CDK output",
      exportName: "HelloWorldMessage",
    });

    // Output the stack name
    new cdk.CfnOutput(this, "StackName", {
      value: this.stackName,
      description: "The name of this stack",
    });

    // Output the region and account
    new cdk.CfnOutput(this, "DeploymentInfo", {
      value: `Stack deployed in region ${this.region} on account ${this.account}`,
      description: "Deployment information",
    });

    // Secret ARNs
    new cdk.CfnOutput(this, "ApiKeySecretArn", {
      value: apiKeySecret.secretArn,
      description: "ARN of the API Key secret",
    });

    new cdk.CfnOutput(this, "DbCredentialsSecretArn", {
      value: dbCredentials.secretArn,
      description: "ARN of the database credentials secret",
    });
  }
}
