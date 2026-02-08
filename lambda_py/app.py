import json
import os
from datetime import datetime, timezone


def handler(event, context):
    """Simple Python Lambda handler (Hello World)."""
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(
            {
                "message": "Hello from Python Lambda!",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "requestId": context.aws_request_id,
                "functionName": context.function_name,
                "region": os.environ.get("AWS_REGION"),
            }
        ),
    }
