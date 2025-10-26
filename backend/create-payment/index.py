'''
Business: Creates Telegram Stars payment invoice and processes payment webhooks
Args: event with POST body containing telegram_id+amount OR webhook update from Telegram
Returns: Payment invoice link or webhook processing result
'''

import json
import os
from typing import Dict, Any
import urllib.request
import urllib.parse
import psycopg2
from datetime import datetime

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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        # Проверяем тип запроса: invoice creation или webhook
        if 'message' in body_data or 'pre_checkout_query' in body_data:
            return handle_webhook(body_data)
        else:
            return create_invoice(body_data)
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }

def create_invoice(body_data: Dict[str, Any]) -> Dict[str, Any]:
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
        'currency': 'XTR',
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

def handle_webhook(update_data: Dict[str, Any]) -> Dict[str, Any]:
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    # Обработка pre_checkout_query (подтверждение оплаты)
    if 'pre_checkout_query' in update_data:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        pre_checkout = update_data['pre_checkout_query']
        query_id = pre_checkout['id']
        
        # Отвечаем OK на pre-checkout
        api_url = f'https://api.telegram.org/bot{bot_token}/answerPreCheckoutQuery'
        answer_data = urllib.parse.urlencode({'pre_checkout_query_id': query_id, 'ok': True}).encode('utf-8')
        req = urllib.request.Request(api_url, data=answer_data, method='POST')
        urllib.request.urlopen(req)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    # Обработка successful_payment
    message = update_data.get('message', {})
    successful_payment = message.get('successful_payment')
    
    if not successful_payment:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    invoice_payload = json.loads(successful_payment.get('invoice_payload', '{}'))
    telegram_id = invoice_payload.get('user_id')
    amount = invoice_payload.get('amount', 0)
    
    if not telegram_id or amount <= 0:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, balance FROM t_p79007879_telegram_casino_mini.users WHERE telegram_id = %s",
        (str(telegram_id),)
    )
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    user_id = user[0]
    current_balance = user[1]
    new_balance = current_balance + amount
    
    cur.execute(
        "UPDATE t_p79007879_telegram_casino_mini.users SET balance = %s WHERE id = %s",
        (new_balance, user_id)
    )
    
    cur.execute(
        """
        INSERT INTO t_p79007879_telegram_casino_mini.transactions (user_id, type, amount, description, created_at)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (user_id, 'deposit', amount, 'Пополнение через Telegram Stars', datetime.now())
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'ok': True,
            'new_balance': new_balance
        })
    }
