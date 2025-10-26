-- Изменяем дефолтный баланс на 0 для новых пользователей
ALTER TABLE t_p79007879_telegram_casino_mini.users 
ALTER COLUMN balance SET DEFAULT 0;

-- Обновляем баланс существующих пользователей на 0
UPDATE t_p79007879_telegram_casino_mini.users 
SET balance = 0;