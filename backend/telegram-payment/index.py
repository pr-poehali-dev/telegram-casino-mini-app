'''
Business: Create Telegram Stars payment invoice
Args: event with httpMethod, body (user_id, amount)
Returns: HTTP response with invoice_link
'''

import json
import os
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Bot token not configured'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    telegram_id = body_data.get('telegram_id')
    stars_amount = body_data.get('stars_amount', 10)
    user_id = body_data.get('user_id')
    
    if not telegram_id:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'telegram_id required'})
        }
    
    telegram_api_url = f'https://api.telegram.org/bot{bot_token}/createInvoiceLink'
    
    invoice_data = {
        'title': f'Пополнение баланса на {stars_amount} ⭐',
        'description': f'Пополнение звёзд в Casino Bot',
        'payload': json.dumps({'user_id': user_id, 'stars': stars_amount}),
        'currency': 'XTR',
        'prices': [{'label': 'Звёзды', 'amount': stars_amount}]
    }
    
    response = requests.post(telegram_api_url, json=invoice_data)
    result = response.json()
    
    if not result.get('ok'):
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': result.get('description', 'Failed to create invoice')})
        }
    
    invoice_link = result['result']
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'invoice_link': invoice_link,
            'stars_amount': stars_amount
        })
    }
