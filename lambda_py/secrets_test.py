import json
import os
import boto3
from botocore.exceptions import ClientError

secretsmanager = boto3.client("secretsmanager")
api_key_secret_arn = os.environ.get("API_KEY_SECRET_ARN")
db_creds_secret_arn = os.environ.get("DB_CREDENTIALS_SECRET_ARN")

def get_secret(secret_arn):
    """Retrieve a secret from AWS Secrets Manager"""
    try:
        response = secretsmanager.get_secret_value(SecretId=secret_arn)
        return json.loads(response['SecretString'])
    except ClientError as e:
        print(f"Error retrieving secret {secret_arn}: {e}")
        raise e
    
def response(status, body):
    return {
        "statusCode": status,
         "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body),
    }   
    
def handler(event, context):
    """Lambda function to test retrieval of secrets from AWS Secrets Manager"""
    try:
        api_key_data = get_secret(api_key_secret_arn)
        db_creds_data = get_secret(db_creds_secret_arn)
        
        return response(200, {
            "message": "Secrets retrieved successfully from AWS Secrets Manager",
            "api_key_secret": {
                "username": api_key_data.get("username"),
                "has_api_key": "api_key" in api_key_data,
                "api_key_length": len(api_key_data.get("api_key", "")),
                "api_key_preview": api_key_data.get("api_key", "")[:4] + "****"
            },
            "db_credentials": {
                "username": db_creds_data.get("username"),
                "database": db_creds_data.get("database"),
                "has_password": "password" in db_creds_data,
                "password_length": len(db_creds_data.get("password", ""))
            }
        })
    except Exception as e:
        return response(500, {"error": f"Failed to retrieve secrets: {str(e)}"})