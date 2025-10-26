'''
Business: Process Telegram payment webhook and credit stars to user balance
Args: event with httpMethod, body (Telegram update)
Returns: HTTP 200 response
'''

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    pre_checkout_query = body_data.get('pre_checkout_query')
    if pre_checkout_query:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    message = body_data.get('message', {})
    successful_payment = message.get('successful_payment')
    
    if not successful_payment:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    payload_str = successful_payment.get('invoice_payload', '{}')
    payload = json.loads(payload_str)
    
    user_id = payload.get('user_id')
    stars = payload.get('stars', 0)
    
    if not user_id or stars <= 0:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE users SET balance = balance + %s WHERE id = %s",
        (stars, user_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({'ok': True})
    }
