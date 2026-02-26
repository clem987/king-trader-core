
-- Create strategies table
CREATE TABLE public.strategies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  market text DEFAULT 'NQ',
  risk_max numeric DEFAULT 100,
  rr_min numeric DEFAULT 2,
  max_trades integer DEFAULT 3,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own strategies"
  ON public.strategies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create strategy_checklists table
CREATE TABLE public.strategy_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id uuid NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('before', 'during', 'after')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(strategy_id, type)
);

ALTER TABLE public.strategy_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own strategy checklists"
  ON public.strategy_checklists FOR ALL
  USING (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = strategy_checklists.strategy_id AND strategies.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = strategy_checklists.strategy_id AND strategies.user_id = auth.uid()));

-- Create strategy_checklist_items table
CREATE TABLE public.strategy_checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id uuid NOT NULL REFERENCES public.strategy_checklists(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_checked boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.strategy_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own strategy checklist items"
  ON public.strategy_checklist_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.strategy_checklists sc
    JOIN public.strategies s ON s.id = sc.strategy_id
    WHERE sc.id = strategy_checklist_items.checklist_id AND s.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.strategy_checklists sc
    JOIN public.strategies s ON s.id = sc.strategy_id
    WHERE sc.id = strategy_checklist_items.checklist_id AND s.user_id = auth.uid()
  ));

-- Function to auto-create 3 checklists when a strategy is created
CREATE OR REPLACE FUNCTION public.create_strategy_checklists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.strategy_checklists (strategy_id, type) VALUES
    (NEW.id, 'before'),
    (NEW.id, 'during'),
    (NEW.id, 'after');
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_checklists_on_strategy
  AFTER INSERT ON public.strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.create_strategy_checklists();

-- Function to ensure only one active strategy per user
CREATE OR REPLACE FUNCTION public.ensure_single_active_strategy()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.strategies SET is_active = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER single_active_strategy
  BEFORE INSERT OR UPDATE ON public.strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_active_strategy();
