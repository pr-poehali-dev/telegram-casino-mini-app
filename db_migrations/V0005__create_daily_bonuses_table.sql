-- Создаём таблицу для отслеживания ежедневных бонусов
CREATE TABLE IF NOT EXISTS t_p79007879_telegram_casino_mini.daily_bonuses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    last_claim_date DATE,
    streak_days INTEGER DEFAULT 0,
    total_claims INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);