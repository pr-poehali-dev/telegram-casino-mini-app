'''
Business: Admin function to add or remove balance for a Telegram user
Args: event with POST body containing telegram_id and amount (positive to add, negative to remove)
Returns: Updated user balance
'''

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        telegram_id = body_data.get('telegram_id')
        amount = body_data.get('amount', 0)
        
        if not telegram_id or amount == 0:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'telegram_id and amount are required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
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
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'User with telegram_id {telegram_id} not found'}),
                'isBase64Encoded': False
            }
        
        user_id = user[0]
        current_balance = user[1]
        new_balance = max(0, current_balance + amount)
        
        cur.execute(
            "UPDATE t_p79007879_telegram_casino_mini.users SET balance = %s WHERE id = %s",
            (new_balance, user_id)
        )
        
        transaction_type = 'admin_add' if amount > 0 else 'admin_remove'
        description = f'Админ {"добавил" if amount > 0 else "снял"} {abs(amount)} звёзд'
        
        cur.execute(
            """
            INSERT INTO transactions (telegram_id, amount, transaction_type, description)
            VALUES (%s, %s, %s, %s)
            """,
            (telegram_id, amount, transaction_type, description)
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
                'success': True,
                'telegram_id': telegram_id,
                'old_balance': current_balance,
                'new_balance': new_balance,
                'amount_changed': amount
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
