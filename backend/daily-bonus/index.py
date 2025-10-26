import json
import os
import psycopg2
from datetime import date, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Система ежедневных бонусов - получение и проверка
    Args: event - dict с httpMethod, body (user_id)
          context - объект с request_id
    Returns: HTTP response с информацией о бонусе
    '''
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
    
    if method == 'GET':
        # Получить статус бонуса для пользователя
        query_params = event.get('queryStringParameters', {})
        user_id = query_params.get('user_id')
        
        if not user_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id is required'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(f"SELECT last_claim_date, streak_days, total_claims FROM t_p79007879_telegram_casino_mini.daily_bonuses WHERE user_id = {user_id}")
        bonus_row = cursor.fetchone()
        
        today = date.today()
        can_claim = True
        streak_days = 0
        total_claims = 0
        next_bonus = 100
        
        if bonus_row:
            last_claim = bonus_row[0]
            streak_days = bonus_row[1]
            total_claims = bonus_row[2]
            
            if last_claim == today:
                can_claim = False
            elif last_claim == today - timedelta(days=1):
                # Streak продолжается
                next_bonus = min(100 + (streak_days * 50), 500)
            else:
                # Streak сброшен
                streak_days = 0
                next_bonus = 100
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'can_claim': can_claim,
                'streak_days': streak_days,
                'total_claims': total_claims,
                'next_bonus': next_bonus
            }),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        # Получить бонус
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        
        if not user_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id is required'}),
                'isBase64Encoded': False
            }
        
        today = date.today()
        
        # Проверяем существующий бонус
        cursor.execute(f"SELECT last_claim_date, streak_days, total_claims FROM t_p79007879_telegram_casino_mini.daily_bonuses WHERE user_id = {user_id}")
        bonus_row = cursor.fetchone()
        
        if bonus_row:
            last_claim = bonus_row[0]
            
            if last_claim == today:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Бонус уже получен сегодня'}),
                    'isBase64Encoded': False
                }
            
            streak_days = bonus_row[1]
            total_claims = bonus_row[2]
            
            # Проверяем, продолжается ли streak
            if last_claim == today - timedelta(days=1):
                new_streak = streak_days + 1
            else:
                new_streak = 1
            
            bonus_amount = min(100 + ((new_streak - 1) * 50), 500)
            
            # Обновляем запись
            cursor.execute(f"""
                UPDATE t_p79007879_telegram_casino_mini.daily_bonuses 
                SET last_claim_date = '{today}', streak_days = {new_streak}, total_claims = {total_claims + 1}
                WHERE user_id = {user_id}
            """)
        else:
            # Создаём новую запись
            new_streak = 1
            bonus_amount = 100
            
            cursor.execute(f"""
                INSERT INTO t_p79007879_telegram_casino_mini.daily_bonuses (user_id, last_claim_date, streak_days, total_claims)
                VALUES ({user_id}, '{today}', 1, 1)
            """)
        
        # Начисляем бонус на баланс
        cursor.execute(f"""
            UPDATE t_p79007879_telegram_casino_mini.users 
            SET balance = balance + {bonus_amount}
            WHERE id = {user_id}
            RETURNING balance
        """)
        
        new_balance_row = cursor.fetchone()
        new_balance = new_balance_row[0] if new_balance_row else 0
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'bonus_amount': bonus_amount,
                'new_balance': new_balance,
                'streak_days': new_streak if bonus_row else 1
            }),
            'isBase64Encoded': False
        }
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
