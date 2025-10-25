CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    balance INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_name VARCHAR(255) NOT NULL,
    item_value INTEGER NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS free_case_cooldowns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    last_free_open TIMESTAMP NOT NULL,
    UNIQUE(user_id)
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_cooldowns_user_id ON free_case_cooldowns(user_id);