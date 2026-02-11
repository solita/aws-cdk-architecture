import json
import os
from datetime import datetime, timezone
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
    method = event.get("httpMethod", "GET")

    if table is None:
        return response(500, {"error": "TABLE_NAME not configured"})
    
    # if event.get("queryStringParameters") and event["queryStringParameters"].get("test") == "error":
    #     print("[ERROR] Testing CloudWatch error logging and alarms!")
    #     raise Exception("Intentional test error for CloudWatch monitoring!")

    if method == "GET":
        # List all items
        try:
            result = table.scan()
            items = result.get("Items", [])
            return response(200, {"items": items})
        except ClientError as e:
            return response(500, {"error": str(e)})

    if method == "POST":
        # Create a new item
        try:
            body = json.loads(event.get("body") or "{}")
            item_id = body.get("id")
            if not item_id:
                return response(400, {"error": "Missing 'id'"})

            item = {"id": item_id, "payload": body.get("payload", {})}
            table.put_item(Item=item)
            return response(201, {"message": "Item created", "item": item})
        except ClientError as e:
            return response(500, {"error": str(e)})

    return response(405, {"error": "Method not allowed"})
