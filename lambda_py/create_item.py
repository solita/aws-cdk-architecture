import json
import os
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("TABLE_NAME")
table = dynamodb.Table(table_name) if table_name else None

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
    """Lambda function to create a new item in DynamoDB"""

    if table is None:
        return response(500, {"error": "DynamoDB table not configured"})
    
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