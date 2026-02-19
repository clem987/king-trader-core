
-- Profiles table for user data and onboarding
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  market TEXT DEFAULT 'NQ',
  trading_session TEXT DEFAULT 'New York',
  max_risk_per_trade NUMERIC DEFAULT 100,
  min_rr NUMERIC DEFAULT 2,
  max_trades_per_day INTEGER DEFAULT 3,
  strategy TEXT DEFAULT '',
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Bronze',
  streak INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Checklist items (customizable per user)
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checklist" ON public.checklist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trades journal
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  setup TEXT DEFAULT '',
  result_amount NUMERIC DEFAULT 0,
  before_photo_url TEXT,
  after_photo_url TEXT,
  respected_plan BOOLEAN DEFAULT false,
  hesitated BOOLEAN DEFAULT false,
  felt_fear BOOLEAN DEFAULT false,
  respected_rr BOOLEAN DEFAULT false,
  discipline_score INTEGER DEFAULT 0,
  execution_quality INTEGER DEFAULT 0,
  plan_respect INTEGER DEFAULT 0,
  emotional_management INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own trades" ON public.trades FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'trader_' || LEFT(NEW.id::text, 8)));
  
  -- Insert default checklist items
  INSERT INTO public.checklist_items (user_id, label, sort_order) VALUES
    (NEW.id, 'Structure claire', 1),
    (NEW.id, 'Alignement VWAP', 2),
    (NEW.id, 'POC tracé', 3),
    (NEW.id, 'Retest validé', 4),
    (NEW.id, 'R:R respecté', 5),
    (NEW.id, 'Pas d''émotion', 6);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
