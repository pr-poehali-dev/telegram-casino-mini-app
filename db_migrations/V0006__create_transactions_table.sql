-- Create transactions table for tracking all balance changes
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by telegram_id
CREATE INDEX idx_transactions_telegram_id ON transactions(telegram_id);

-- Create index for sorting by date
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);