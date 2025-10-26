'''
Business: Creates Telegram Stars payment invoice for user balance top-up
Args: event with httpMethod POST, body with user_id and amount
Returns: Payment invoice link or error
'''

import json
import os
from typing import Dict, Any
import urllib.request
import urllib.parse

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
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Bot token not configured'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        telegram_id = body_data.get('telegram_id')
        amount = body_data.get('amount', 0)
        
        if not telegram_id or amount <= 0:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid telegram_id or amount'})
            }
        
        # Создаём invoice для Telegram Stars
        api_url = f'https://api.telegram.org/bot{bot_token}/createInvoiceLink'
        
        invoice_data = {
            'title': f'Пополнение баланса на {amount} ⭐',
            'description': f'Покупка {amount} звёзд для игры в казино',
            'payload': json.dumps({'user_id': telegram_id, 'amount': amount}),
            'currency': 'XTR',  # Telegram Stars
            'prices': json.dumps([{'label': f'{amount} звёзд', 'amount': amount}])
        }
        
        data = urllib.parse.urlencode(invoice_data).encode('utf-8')
        req = urllib.request.Request(api_url, data=data, method='POST')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'invoice_link': result['result']
                    })
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': result.get('description', 'Failed to create invoice')})
                }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
