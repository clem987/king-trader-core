
-- Add new columns to trades table for enriched trade form
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS pair text DEFAULT '',
  ADD COLUMN IF NOT EXISTS direction text DEFAULT '',
  ADD COLUMN IF NOT EXISTS rr_achieved numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS setup_respected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_respected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS emotion text DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS clarity_score integer DEFAULT 3;
