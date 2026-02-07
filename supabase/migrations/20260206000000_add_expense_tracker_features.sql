-- Migration: Add expense tracker features
-- Features: Status system, Split expenses, Budget alerts, Transaction type

-- Add new columns to food_orders table
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'expense' CHECK (transaction_type IN ('income', 'expense', 'split')),
ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS split_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS split_people INTEGER,
ADD COLUMN IF NOT EXISTS split_method TEXT CHECK (split_method IN ('equal', 'manual')),
ADD COLUMN IF NOT EXISTS split_shares JSONB,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;

-- Add budget alert settings to user_budgets table
ALTER TABLE public.user_budgets
ADD COLUMN IF NOT EXISTS alert_threshold DECIMAL(5,2) DEFAULT 80.00,
ADD COLUMN IF NOT EXISTS enable_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_alert_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS budget_period TEXT DEFAULT 'monthly' CHECK (budget_period IN ('daily', 'weekly', 'monthly'));

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON public.food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_transaction_type ON public.food_orders(transaction_type);
CREATE INDEX IF NOT EXISTS idx_food_orders_is_split ON public.food_orders(is_split) WHERE is_split = true;

-- Create view for expense statistics with status
CREATE OR REPLACE VIEW public.expense_statistics AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  SUM(amount) FILTER (WHERE status = 'completed' AND transaction_type = 'expense') as total_expenses,
  SUM(amount) FILTER (WHERE status = 'completed' AND transaction_type = 'income') as total_income,
  SUM(amount) FILTER (WHERE status = 'completed' AND is_split = true) as total_split_expenses,
  COUNT(*) FILTER (WHERE is_split = true) as split_count
FROM public.food_orders
GROUP BY user_id;

-- Create function to calculate budget usage percentage
CREATE OR REPLACE FUNCTION public.get_budget_usage(
  p_user_id UUID,
  p_period TEXT DEFAULT 'monthly'
)
RETURNS TABLE (
  total_spent DECIMAL,
  budget_limit DECIMAL,
  percentage_used DECIMAL,
  remaining DECIMAL,
  alert_threshold DECIMAL,
  should_alert BOOLEAN
) AS $$
DECLARE
  v_budget DECIMAL;
  v_spent DECIMAL;
  v_threshold DECIMAL;
BEGIN
  -- Get budget and threshold
  SELECT 
    CASE 
      WHEN p_period = 'daily' THEN ub.daily_budget
      WHEN p_period = 'weekly' THEN ub.weekly_budget
      ELSE ub.monthly_budget
    END,
    ub.alert_threshold
  INTO v_budget, v_threshold
  FROM public.user_budgets ub
  WHERE ub.user_id = p_user_id OR ub.user_id IS NULL
  LIMIT 1;
  
  -- Set defaults if no budget exists
  IF v_budget IS NULL THEN
    v_budget := CASE 
      WHEN p_period = 'daily' THEN 400
      WHEN p_period = 'weekly' THEN 2500
      ELSE 10000
    END;
  END IF;
  
  IF v_threshold IS NULL THEN
    v_threshold := 80;
  END IF;

  -- Calculate spending for the period
  SELECT COALESCE(SUM(fo.amount), 0)
  INTO v_spent
  FROM public.food_orders fo
  WHERE (fo.user_id = p_user_id OR fo.user_id IS NULL)
    AND fo.status = 'completed'
    AND fo.transaction_type = 'expense'
    AND CASE
      WHEN p_period = 'daily' THEN fo.order_date >= CURRENT_DATE
      WHEN p_period = 'weekly' THEN fo.order_date >= DATE_TRUNC('week', CURRENT_DATE)
      ELSE fo.order_date >= DATE_TRUNC('month', CURRENT_DATE)
    END;

  RETURN QUERY
  SELECT 
    v_spent,
    v_budget,
    ROUND((v_spent / NULLIF(v_budget, 0)) * 100, 2),
    v_budget - v_spent,
    v_threshold,
    (v_spent / NULLIF(v_budget, 0)) * 100 >= v_threshold;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle expense cancellation
CREATE OR REPLACE FUNCTION public.cancel_expense(
  p_expense_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.food_orders
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancelled_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_expense_id
    AND status IN ('pending', 'completed');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to split expense equally
CREATE OR REPLACE FUNCTION public.split_expense_equally(
  p_total_amount DECIMAL,
  p_people INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_share DECIMAL;
  v_remainder DECIMAL;
  v_shares JSONB;
  i INTEGER;
BEGIN
  v_share := FLOOR(p_total_amount / p_people * 100) / 100;
  v_remainder := p_total_amount - (v_share * p_people);
  
  v_shares := '[]'::JSONB;
  
  FOR i IN 1..p_people LOOP
    IF i = 1 THEN
      v_shares := v_shares || jsonb_build_object(
        'person', i,
        'amount', v_share + v_remainder
      );
    ELSE
      v_shares := v_shares || jsonb_build_object(
        'person', i,
        'amount', v_share
      );
    END IF;
  END LOOP;
  
  RETURN v_shares;
END;
$$ LANGUAGE plpgsql;

-- Add comment documentation
COMMENT ON COLUMN public.food_orders.status IS 'Transaction status: pending, completed, failed, cancelled';
COMMENT ON COLUMN public.food_orders.transaction_type IS 'Type: income, expense, or split';
COMMENT ON COLUMN public.food_orders.is_split IS 'Whether this is a split expense';
COMMENT ON COLUMN public.food_orders.split_total IS 'Total amount before splitting';
COMMENT ON COLUMN public.food_orders.split_people IS 'Number of people to split between';
COMMENT ON COLUMN public.food_orders.split_method IS 'How to split: equal or manual';
COMMENT ON COLUMN public.food_orders.split_shares IS 'JSON array of split amounts per person';
COMMENT ON COLUMN public.user_budgets.alert_threshold IS 'Percentage at which to send budget alerts (default 80%)';
