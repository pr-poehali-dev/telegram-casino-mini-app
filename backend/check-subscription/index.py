'''
Business: Check Telegram subscription + daily login bonus (5 stars base, +5 per day)
Args: GET with user_id (subscription or bonus check), POST with user_id (claim bonus)
Returns: Subscription/bonus status or claimed bonus
'''

import json
import os
from typing import Dict, Any
from datetime import datetime, timedelta
import urllib.request
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('user_id')
        check_type = params.get('type', 'subscription')
        channel_username = params.get('channel', 'tgDuckCasino')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'user_id is required'}),
                'isBase64Encoded': False
            }
        
        if check_type == 'bonus':
            dsn = os.environ.get('DATABASE_URL')
            if not dsn:
                return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Database not configured'}), 'isBase64Encoded': False}
            
            conn = psycopg2.connect(dsn)
            cur = conn.cursor()
            cur.execute("SELECT last_daily_bonus, daily_streak FROM t_p79007879_telegram_casino_mini.users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            cur.close()
            conn.close()
            
            if not user:
                return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User not found'}), 'isBase64Encoded': False}
            
            last_bonus = user[0]
            streak_days = user[1] or 0
            can_claim = True
            if last_bonus:
                last_bonus_date = last_bonus.date() if hasattr(last_bonus, 'date') else last_bonus
                can_claim = last_bonus_date < datetime.now().date()
            
            next_bonus = 5 + (streak_days * 5)
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'isBase64Encoded': False, 'body': json.dumps({'can_claim': can_claim, 'streak_days': streak_days, 'next_bonus': next_bonus})}
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Bot token not configured'}), 'isBase64Encoded': False}
        
        try:
            url = f'https://api.telegram.org/bot{bot_token}/getChatMember?chat_id=@{channel_username}&user_id={user_id}'
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                if result.get('ok'):
                    status = result.get('result', {}).get('status', 'left')
                    is_subscribed = status in ['member', 'administrator', 'creator']
                    return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'isBase64Encoded': False, 'body': json.dumps({'subscribed': is_subscribed, 'status': status})}
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'isBase64Encoded': False, 'body': json.dumps({'subscribed': False, 'error': result.get('description', 'Unknown error')})}
        except Exception as e:
            return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'subscribed': False, 'error': str(e)}), 'isBase64Encoded': False}
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        
        if not user_id:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'user_id is required'}), 'isBase64Encoded': False}
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Database not configured'}), 'isBase64Encoded': False}
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute("SELECT id, balance, last_daily_bonus, daily_streak, telegram_id FROM t_p79007879_telegram_casino_mini.users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User not found'}), 'isBase64Encoded': False}
        
        user_id_db, current_balance, last_bonus, streak_days, telegram_id = user[0], user[1], user[2], user[3] or 0, user[4]
        today = datetime.now().date()
        
        if last_bonus:
            last_bonus_date = last_bonus.date() if hasattr(last_bonus, 'date') else last_bonus
            if last_bonus_date >= today:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Bonus already claimed today'}), 'isBase64Encoded': False}
            
            yesterday = today - timedelta(days=1)
            streak_days = streak_days + 1 if last_bonus_date == yesterday else 1
        else:
            streak_days = 1
        
        bonus_amount = 5 + ((streak_days - 1) * 5)
        new_balance = current_balance + bonus_amount
        
        cur.execute("UPDATE t_p79007879_telegram_casino_mini.users SET balance = %s, last_daily_bonus = %s, daily_streak = %s WHERE id = %s", (new_balance, datetime.now(), streak_days, user_id_db))
        cur.execute("INSERT INTO transactions (telegram_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s)", (telegram_id, bonus_amount, 'daily_bonus', f'Ежедневный бонус (день {streak_days})'))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'isBase64Encoded': False, 'body': json.dumps({'success': True, 'bonus_amount': bonus_amount, 'new_balance': new_balance, 'streak_days': streak_days})}
    
    return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
