import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Авторизация и регистрация пользователей через Telegram
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id
    Returns: HTTP response с данными пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-User',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    telegram_id = body_data.get('telegram_id')
    username = body_data.get('username', '')
    first_name = body_data.get('first_name', '')
    last_name = body_data.get('last_name', '')
    
    if not telegram_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'telegram_id is required'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT id, telegram_id, username, first_name, last_name, balance FROM t_p79007879_telegram_casino_mini.users WHERE telegram_id = {telegram_id}")
    existing_user = cursor.fetchone()
    
    if existing_user:
        user_id = existing_user[0]
        cursor.execute(f"UPDATE t_p79007879_telegram_casino_mini.users SET last_login = CURRENT_TIMESTAMP WHERE id = {user_id}")
        conn.commit()
        
        cursor.execute(f"SELECT item_name, item_value, rarity FROM t_p79007879_telegram_casino_mini.user_inventory WHERE user_id = {user_id}")
        inventory_rows = cursor.fetchall()
        inventory = [{'name': row[0], 'value': row[1], 'rarity': row[2]} for row in inventory_rows]
        
        cursor.execute(f"SELECT last_free_open FROM t_p79007879_telegram_casino_mini.free_case_cooldowns WHERE user_id = {user_id}")
        cooldown_row = cursor.fetchone()
        last_free_open = cooldown_row[0].isoformat() if cooldown_row else None
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': user_id,
                    'telegram_id': existing_user[1],
                    'username': existing_user[2],
                    'first_name': existing_user[3],
                    'last_name': existing_user[4],
                    'balance': existing_user[5]
                },
                'inventory': inventory,
                'last_free_open': last_free_open,
                'is_new': False
            }),
            'isBase64Encoded': False
        }
    else:
        username_escaped = username.replace("'", "''")
        first_name_escaped = first_name.replace("'", "''")
        last_name_escaped = last_name.replace("'", "''")
        
        cursor.execute(
            f"INSERT INTO t_p79007879_telegram_casino_mini.users (telegram_id, username, first_name, last_name) VALUES ({telegram_id}, '{username_escaped}', '{first_name_escaped}', '{last_name_escaped}') RETURNING id, balance"
        )
        new_user = cursor.fetchone()
        user_id = new_user[0]
        balance = new_user[1]
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': user_id,
                    'telegram_id': telegram_id,
                    'username': username,
                    'first_name': first_name,
                    'last_name': last_name,
                    'balance': balance
                },
                'inventory': [],
                'last_free_open': None,
                'is_new': True
            }),
            'isBase64Encoded': False
        }