-- Add email authentication fields to users table
ALTER TABLE t_p79007879_telegram_casino_mini.users 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
  ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON t_p79007879_telegram_casino_mini.users(email);