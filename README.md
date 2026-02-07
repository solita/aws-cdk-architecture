# AWS CDK + TypeScript Demo

This is a CDK project for AWS infrastructure development with TypeScript.

## Prerequisites

- Node.js (v18 or later)
- AWS CLI configured with credentials
- AWS CDK CLI (`npm install -g aws-cdk`)

## Useful Commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk bootstrap`   bootstrap your AWS environment (one-time setup)

## Getting Started

1. Configure your AWS credentials:
   ```bash
   aws configure
   ```

2. Bootstrap CDK (first time only):
   ```bash
   cdk bootstrap
   ```

3. Deploy your stack:
   ```bash
   cdk deploy
   ```

## Project Structure

- `bin/aws-demo.ts` - Entry point for the CDK app
- `lib/aws-demo-stack.ts` - Main stack definition
- `cdk.json` - CDK configuration
- `tsconfig.json` - TypeScript configuration
