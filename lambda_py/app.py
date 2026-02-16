import json
import os
from datetime import datetime, timezone
import boto3 
from botocore.exceptions import ClientError

secretsmanager = boto3.client("secretsmanager")
dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("TABLE_NAME")
table = dynamodb.Table(table_name) if table_name else None
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

def handle_secrets_test():
    """Retrieve and display secrets metadata"""
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

def handle_get_items():
    """List all items from DynamoDB"""
    try:
        result = table.scan()
        return response(200, {"items": result.get("Items", [])})
    except ClientError as e:
        return response(500, {"error": str(e)})

def handle_create_item(event):
    """Create a new item in DynamoDB"""
    try:
        body = json.loads(event.get("body", "{}"))
        item_id = body.get("id")
        
        if not item_id:
            return response(400, {"error": "Missing 'id'"})
        
        item = {"id": item_id, "payload": body.get("payload", {})}
        table.put_item(Item=item)
        return response(201, {"message": "Item created", "item": item})
    except ClientError as e:
        return response(500, {"error": str(e)})

def handler(event, context):
    if table is None:
        return response(500, {"error": "TABLE_NAME not configured"})
    
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    
    # Route handling
    if path == "/secrets-test" and method == "GET":
        return handle_secrets_test()
    
    if path == "/" and method == "GET":
        return handle_get_items()
    
    if path == "/" and method == "POST":
        return handle_create_item(event)
    
    return response(405, {"error": "Method not allowed"})
