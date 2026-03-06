ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS monthly_sessions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_sessions_reset_at date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS last_session_date date,
ADD COLUMN IF NOT EXISTS best_streak integer DEFAULT 0;