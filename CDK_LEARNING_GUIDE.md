# AWS CDK Learning Guide 🚀

This guide covers all your mentoring program tasks with practical examples.

---

## ✅ Task 1: Install and Setup AWS CDK

**Status: COMPLETED**

```bash
# CDK is installed globally
cdk --version  # 2.1034.0

# Project dependencies installed
npm install
```

---

## ✅ Task 2: Understand CDK Concepts

### Key Concepts:

#### 1. **App** (`bin/aws-demo.ts`)
- Entry point of your CDK application
- Creates and manages stacks
```typescript
const app = new cdk.App();
new AwsDemoStack(app, 'AwsDemoStack');
```

#### 2. **Stack** (`lib/aws-demo-stack.ts`)
- Unit of deployment (becomes a CloudFormation stack)
- Contains AWS resources (constructs)
- Can have multiple stacks in one app

#### 3. **Constructs**
- Building blocks of CDK apps
- Three levels:
  - **L1 (CfnXxx)**: Direct CloudFormation resources
  - **L2**: Higher-level, AWS-recommended patterns
  - **L3**: Complete solutions (patterns)

---

## ✅ Task 3: Hello World CDK Stack

**Status: IMPLEMENTED** ✨

The `lib/aws-demo-stack.ts` now includes a Hello World example with CloudFormation outputs.

**Test it:**
```bash
# 1. Synthesize the CloudFormation template
cdk synth

# 2. See what will be deployed
cdk diff

# 3. Deploy (requires AWS credentials)
cdk deploy
```

---

## 📋 Task 4: Create Your First Lambda

**Coming next!** We'll create:
- Lambda function code
- Lambda construct in CDK
- Proper deployment bundling

---

## 📋 Task 5: Add IAM Roles and Permissions

We'll implement:
- Custom IAM role for Lambda
- Policies for accessing AWS services
- Principle of least privilege

---

## 📋 Task 6: Add API Gateway → Lambda

We'll build:
- REST API Gateway
- Lambda integration
- CORS configuration
- API endpoints

---

## 📋 Task 7: Deploy CDK Stack to AWS

**Prerequisites:**
```bash
# Configure AWS credentials
aws configure

# Bootstrap CDK (one-time per account/region)
cdk bootstrap
```

**Deployment commands:**
```bash
cdk deploy              # Deploy changes
cdk deploy --all        # Deploy all stacks
cdk deploy --require-approval never  # Auto-approve
```

---

## 📋 Task 8: Understand CDK Commands

### Essential Commands:

```bash
# Development
cdk synth          # Generate CloudFormation template
cdk diff           # Show differences before deployment
cdk deploy         # Deploy stack to AWS
cdk destroy        # Remove all resources

# Utilities
cdk ls             # List all stacks in the app
cdk doctor         # Check environment setup
cdk context        # Manage context values
cdk metadata       # Display metadata

# Advanced
cdk watch          # Watch for changes and auto-deploy
cdk bootstrap      # Setup CDK toolkit stack (one-time)
```

---

## 📋 Task 9: Learn Project Structure

### Current Structure:
```
AWS-Demo/
├── bin/
│   └── aws-demo.ts          # App entry point
├── lib/
│   └── aws-demo-stack.ts    # Stack definitions
├── lambda/                   # (Coming) Lambda functions
├── cdk.json                  # CDK configuration
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
└── README.md                # Project docs
```

### Best Practices:
1. **Separation of concerns**: One stack per environment or service
2. **Environment variables**: Use context or environment-specific configs
3. **Reusable constructs**: Create custom constructs for common patterns
4. **Testing**: Write unit tests for your stacks

---

## 📋 Task 10: Real Cloud Development

Key patterns used in production:
- Multiple environments (dev, staging, prod)
- Parameterized stacks
- Cross-stack references
- Resource tagging
- Cost optimization
- Security best practices

---

## 📋 Task 11: Add Backend + Database

We'll implement:
- **DynamoDB table** for data storage
- **Lambda functions** for CRUD operations
- **API Gateway** for REST endpoints
- Complete serverless backend

---

## 📋 Task 12: Build CDK Pipeline (CI/CD)

We'll create:
- CDK Pipeline construct
- GitHub/CodeCommit integration
- Automated testing
- Multi-stage deployment

---

## 🎯 Next Steps

1. **Test Hello World deployment**
2. **Create Lambda function**
3. **Add IAM permissions**
4. **Connect API Gateway**
5. **Add DynamoDB**
6. **Build complete CRUD API**

---

## 📚 Useful Resources

- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Patterns](https://cdkpatterns.com/)
- [AWS CDK Examples](https://github.com/aws-samples/aws-cdk-examples)
- [CDK Workshop](https://cdkworkshop.com/)

---

## 💡 Pro Tips

1. Always run `cdk diff` before `cdk deploy`
2. Use `cdk watch` for rapid development
3. Add meaningful descriptions to outputs
4. Tag all resources for cost tracking
5. Use CDK context for environment-specific values
6. Keep Lambda functions in separate directories
7. Use CDK Nag for security best practices
