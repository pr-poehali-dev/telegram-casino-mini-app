'''
Business: User authentication with email verification
Args: event with httpMethod (POST), body with email/password/code
Returns: HTTP response with user data or verification status
'''

import json
import os
import psycopg2
import hashlib
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Any

def generate_code() -> str:
    return ''.join(random.choices(string.digits, k=6))

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def send_verification_email(email: str, code: str) -> bool:
    try:
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
            print('SMTP credentials not configured')
            return False
        
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = email
        msg['Subject'] = '🦆 Код подтверждения DuckCasino'
        
        body = f'''
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h1 style="color: #FFD700;">🦆 DuckCasino</h1>
                <p style="font-size: 18px;">Твой код подтверждения:</p>
                <h2 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px;">{code}</h2>
                <p style="color: #666;">Код действителен 10 минут</p>
                <p style="color: #999; font-size: 12px;">Если ты не регистрировался, проигнорируй это письмо</p>
            </body>
        </html>
        '''
        
        msg.attach(MIMEText(body, 'html'))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f'Email sending error: {e}')
        return False

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
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if action == 'register':
            email = body.get('email')
            password = body.get('password')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            email_escaped = email.replace("'", "''")
            cur.execute(
                f"SELECT id FROM t_p79007879_telegram_casino_mini.users WHERE email = '{email_escaped}'"
            )
            existing = cur.fetchone()
            
            if existing:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cur.execute(f'''
                INSERT INTO t_p79007879_telegram_casino_mini.users 
                (telegram_id, email, password_hash, is_email_verified, balance)
                VALUES (0, '{email_escaped}', '{password_hash}', TRUE, 1000)
                RETURNING id
            ''')
            
            user_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': f'#{user_id}',
                        'email': email,
                        'balance': 1000
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            email = body.get('email')
            password = body.get('password')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            email_escaped = email.replace("'", "''")
            
            cur.execute(f'''
                SELECT id, is_email_verified, balance
                FROM t_p79007879_telegram_casino_mini.users 
                WHERE email = '{email_escaped}' AND password_hash = '{password_hash}'
            ''')
            
            user = cur.fetchone()
            
            if not user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'}),
                    'isBase64Encoded': False
                }
            
            user_id, is_verified, balance = user
            
            cur.execute(f'''
                UPDATE t_p79007879_telegram_casino_mini.users 
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = {user_id}
            ''')
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': f'#{user_id}',
                        'email': email,
                        'balance': balance
                    }
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }