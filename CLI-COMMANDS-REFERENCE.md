# AWS CDK CLI Commands Reference

This document contains all the CLI commands used in this project with detailed explanations.

---

## 📦 Node.js & NPM Commands

### Check Node.js Version
```bash
node --version
```
**Purpose**: Check which version of Node.js is installed  
**Output**: Shows version number (e.g., v18.20.8)  
**When to use**: Verify Node.js installation or check version compatibility

---

### Initialize Node.js Project
```bash
npm init -y
```
**Purpose**: Create a new `package.json` file for your Node.js project  
**Flags**:
- `-y`: Auto-answer "yes" to all prompts (uses defaults)

**Output**: Creates `package.json` with default values  
**When to use**: Starting a new Node.js/TypeScript project

---

### Install Development Dependencies
```bash
npm install -D <package-name>
```
**Purpose**: Install packages needed only during development (not in production)  
**Flags**:
- `-D` or `--save-dev`: Save to devDependencies in package.json

**Examples**:
```bash
npm install -D aws-cdk typescript @types/node ts-node
npm install -D @types/aws-lambda
npm install -D esbuild
```

**When to use**: Installing build tools, type definitions, testing libraries

---

### Install Production Dependencies
```bash
npm install <package-name>
```
**Purpose**: Install packages needed in production  
**Examples**:
```bash
npm install aws-cdk-lib constructs
npm install source-map-support
```

**When to use**: Installing runtime dependencies

---

### Run NPM Scripts
```bash
npm run <script-name>
```
**Purpose**: Execute scripts defined in `package.json`

**Common scripts**:
```bash
npm run build    # Compile TypeScript to JavaScript
npm run watch    # Watch mode - recompile on file changes
npm run test     # Run tests
```

---

## 🔐 AWS CLI Commands

### Check AWS CLI Version
```bash
aws --version
```
**Purpose**: Verify AWS CLI is installed and check version  
**Output**: Shows AWS CLI version, Python version, and OS  
**When to use**: Troubleshooting AWS CLI issues

---

### Configure AWS Credentials
```bash
aws configure
```
**Purpose**: Set up AWS credentials and default region  
**Prompts**:
1. AWS Access Key ID
2. AWS Secret Access Key
3. Default region name (e.g., eu-north-1, us-east-1)
4. Default output format (json, yaml, text, table)

**When to use**: First-time setup or changing credentials/region

---

### View AWS Configuration
```bash
aws configure list
```
**Purpose**: Display current AWS CLI configuration  
**Output**: Shows access key, secret key (masked), region, and profile  
**When to use**: Verify credentials are configured correctly

---

### Get AWS Account Identity
```bash
aws sts get-caller-identity
```
**Purpose**: Show which AWS account and user you're authenticated as  
**Output**:
```json
{
    "UserId": "AIDAXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/YourName"
}
```
**When to use**: Verify you're using the correct AWS account

---

### CloudFormation Stack Operations

#### Describe Stack
```bash
aws cloudformation describe-stacks --stack-name <stack-name>
```
**Purpose**: Get detailed information about a CloudFormation stack  
**Flags**:
- `--stack-name`: Name of the stack to describe
- `--query`: Filter output (JMESPath query)

**Example**:
```bash
aws cloudformation describe-stacks --stack-name AwsDemoStack --query 'Stacks[0].StackStatus'
```

---

#### Delete Stack
```bash
aws cloudformation delete-stack --stack-name <stack-name>
```
**Purpose**: Delete a CloudFormation stack and all its resources  
**When to use**: Cleaning up failed deployments or removing infrastructure

---

#### Wait for Stack Deletion
```bash
aws cloudformation wait stack-delete-complete --stack-name <stack-name>
```
**Purpose**: Wait (blocks) until stack deletion is complete  
**When to use**: In scripts where you need to ensure stack is deleted before proceeding

---

#### List Stacks
```bash
aws cloudformation list-stacks --stack-status-filter <status>
```
**Purpose**: List all CloudFormation stacks with specific status  
**Common filters**:
- `CREATE_COMPLETE`
- `UPDATE_COMPLETE`
- `DELETE_COMPLETE`
- `ROLLBACK_COMPLETE`
- `DELETE_IN_PROGRESS`

**Example**:
```bash
aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE --query 'StackSummaries[?StackName==`AwsDemoStack`].[StackName,StackStatus]' --output table
```

---

### Lambda Operations

#### Invoke Lambda Function
```bash
aws lambda invoke --function-name <function-name> --payload '<json>' <output-file>
```
**Purpose**: Execute a Lambda function and save response to a file  
**Flags**:
- `--function-name`: Name or ARN of the Lambda function
- `--payload`: JSON input data for the function
- Output file: Where to save the response

**Example**:
```bash
aws lambda invoke --function-name AwsDemoStack-HelloLambdaFunction3DCA9067-jaA73pZJTAvO --payload '{}' response.json
```

**When to use**: Testing Lambda functions, debugging, manual invocation

---

## 🚀 AWS CDK Commands

### Check CDK Version
```bash
cdk --version
```
**Purpose**: Display installed AWS CDK version  
**Output**: Version number (e.g., 2.1034.0)  
**When to use**: Verify CDK installation

---

### Bootstrap CDK
```bash
cdk bootstrap
```
**Purpose**: Prepare AWS account/region for CDK deployments (ONE-TIME setup)  
**What it does**:
- Creates S3 bucket for storing assets (Lambda code, Docker images)
- Creates IAM roles for CloudFormation
- Sets up necessary permissions

**Output**: Creates a CloudFormation stack named `CDKToolkit`  
**When to use**: 
- First time using CDK in an AWS account/region
- When switching to a new region

---

### Synthesize Stack
```bash
cdk synth
```
**Purpose**: Generate CloudFormation template from CDK code (NO deployment)  
**What it does**:
- Compiles TypeScript code
- Converts CDK code to CloudFormation JSON/YAML
- Saves output to `cdk.out/` folder
- Prints template to terminal

**Flags**:
- `--quiet`: Don't print template to terminal
- `--output <dir>`: Change output directory

**When to use**:
- Check if CDK code is valid
- Preview CloudFormation template before deployment
- Debugging infrastructure definitions

---

### Show Differences
```bash
cdk diff
```
**Purpose**: Compare deployed stack with current CDK code  
**Output**: Shows what will be added, changed, or removed  
**When to use**: Before deployment to see what changes will be made

---

### Deploy Stack
```bash
cdk deploy
```
**Purpose**: Deploy CDK stack to AWS  
**What it does**:
1. Runs `cdk synth` to generate template
2. Packages and uploads assets (Lambda code) to S3
3. Creates/updates CloudFormation stack
4. Waits for deployment to complete
5. Displays outputs

**Flags**:
- `--require-approval never`: Don't ask for confirmation (useful for CI/CD)
- `--all`: Deploy all stacks in the app
- `--outputs-file <file>`: Save outputs to a file

**Example**:
```bash
cdk deploy --require-approval never
```

**When to use**: Creating or updating AWS infrastructure

---

### Destroy Stack
```bash
cdk destroy
```
**Purpose**: Delete CDK stack and all its resources from AWS  
**When to use**: Cleaning up resources, removing infrastructure

---

### List Stacks
```bash
cdk list
```
**Purpose**: List all stacks in your CDK app  
**When to use**: Projects with multiple stacks

---

### View Stack Outputs
```bash
cdk deploy --outputs-file outputs.json
```
**Purpose**: Save stack outputs to a JSON file  
**When to use**: Accessing resource IDs/ARNs in scripts or other tools

---

## 🛠️ TypeScript Commands

### Compile TypeScript
```bash
tsc
```
**Purpose**: Compile all TypeScript files to JavaScript  
**Configuration**: Uses settings from `tsconfig.json`  
**Output**: Creates `.js` files in `dist/` folder  
**When to use**: Before running or deploying code

---

### Watch Mode
```bash
tsc -w
```
**Purpose**: Continuously watch and recompile TypeScript files on changes  
**When to use**: During active development

---

## 🧹 Utility Commands

### Remove Directory
```bash
rm -rf <directory>
```
**Purpose**: Delete a directory and all its contents  
**Flags**:
- `-r`: Recursive (delete folders and contents)
- `-f`: Force (don't prompt for confirmation)

**Example**:
```bash
rm -rf dist  # Clean build output
rm -rf node_modules  # Remove dependencies
```

**⚠️ Warning**: Be careful with this command - it permanently deletes files!

---

### View File Contents
```bash
cat <file>
```
**Purpose**: Display file contents in terminal  
**Example**:
```bash
cat response.json  # View Lambda response
```

---

### JSON Pretty Print
```bash
cat <file> | jq .
```
**Purpose**: Format and colorize JSON output  
**Example**:
```bash
cat response.json | jq .
```

---

## 📊 Command Workflows

### Complete CDK Deployment Workflow
```bash
# 1. Build TypeScript
npm run build

# 2. Check what will change (optional)
cdk diff

# 3. Deploy to AWS
cdk deploy

# 4. Test the deployed resources
aws lambda invoke --function-name <function-name> --payload '{}' response.json
cat response.json | jq .
```

---

### First-Time Setup Workflow
```bash
# 1. Initialize project
npm init -y

# 2. Install dependencies
npm install -D aws-cdk typescript @types/node ts-node
npm install aws-cdk-lib constructs

# 3. Configure AWS
aws configure

# 4. Verify AWS connection
aws sts get-caller-identity

# 5. Bootstrap CDK (one-time)
cdk bootstrap

# 6. Deploy
npm run build
cdk deploy
```

---

### Cleanup Workflow
```bash
# 1. Destroy CDK stack
cdk destroy

# 2. Or use AWS CLI to delete stack
aws cloudformation delete-stack --stack-name AwsDemoStack

# 3. Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name AwsDemoStack
```

---

## 🎯 Quick Reference Table

| Task | Command |
|------|---------|
| Install CDK globally | `npm install -g aws-cdk` |
| Check CDK version | `cdk --version` |
| Bootstrap account | `cdk bootstrap` |
| Preview changes | `cdk diff` |
| Deploy stack | `cdk deploy` |
| Generate CloudFormation | `cdk synth` |
| Destroy stack | `cdk destroy` |
| Invoke Lambda | `aws lambda invoke --function-name <name> --payload '{}' out.json` |
| Configure AWS | `aws configure` |
| Check AWS identity | `aws sts get-caller-identity` |
| Build TypeScript | `npm run build` |
| Watch TypeScript | `npm run watch` |

---

## 📝 Tips & Best Practices

1. **Always run `cdk diff` before `cdk deploy`** to see what will change
2. **Use `--require-approval never` in CI/CD pipelines** to avoid manual confirmation
3. **Bootstrap once per account/region combination**
4. **Use `cdk synth` to debug infrastructure code** without deploying
5. **Save outputs** with `--outputs-file` for automation
6. **Tag resources** for cost tracking and organization
7. **Use `aws sts get-caller-identity`** to verify you're in the correct AWS account

---

## 🔍 Troubleshooting Commands

### Check if CDK bootstrap is complete
```bash
aws cloudformation describe-stacks --stack-name CDKToolkit --query 'Stacks[0].StackStatus'
```

### View CloudFormation events (deployment progress)
```bash
aws cloudformation describe-stack-events --stack-name AwsDemoStack --max-items 10
```

### Get Lambda function details
```bash
aws lambda get-function --function-name <function-name>
```

### View Lambda logs
```bash
aws logs tail /aws/lambda/<function-name> --follow
```

---

**Last Updated**: December 14, 2025  
**Project**: AWS-Demo  
**Author**: Drashti
