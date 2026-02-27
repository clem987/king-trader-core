
-- Add is_required column to strategy_checklist_items
ALTER TABLE public.strategy_checklist_items
ADD COLUMN is_required boolean NOT NULL DEFAULT true;
