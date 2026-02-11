#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsDemoStack } from '../lib/aws-demo-stack';

const app = new cdk.App();
new AwsDemoStack(app, 'AwsDemoStack', {
  // Required for AWS Budgets and other account-specific resources
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});
