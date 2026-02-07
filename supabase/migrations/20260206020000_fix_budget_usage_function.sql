-- Fix: Ambiguous column reference in get_budget_usage function

-- Drop and recreate the function with proper table aliases
DROP FUNCTION IF EXISTS public.get_budget_usage(UUID, TEXT);

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
  -- Get budget and threshold with proper table alias
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

  -- Calculate spending for the period with proper table alias
  SELECT COALESCE(SUM(fo.amount), 0)
  INTO v_spent
  FROM public.food_orders fo
  WHERE (fo.user_id = p_user_id OR fo.user_id IS NULL)
    AND COALESCE(fo.status, 'completed') = 'completed'
    AND COALESCE(fo.transaction_type, 'expense') = 'expense'
    AND CASE
      WHEN p_period = 'daily' THEN fo.order_date >= CURRENT_DATE
      WHEN p_period = 'weekly' THEN fo.order_date >= DATE_TRUNC('week', CURRENT_DATE)
      ELSE fo.order_date >= DATE_TRUNC('month', CURRENT_DATE)
    END;

  RETURN QUERY
  SELECT 
    v_spent AS total_spent,
    v_budget AS budget_limit,
    ROUND((v_spent / NULLIF(v_budget, 0)) * 100, 2) AS percentage_used,
    v_budget - v_spent AS remaining,
    v_threshold AS alert_threshold,
    (v_spent / NULLIF(v_budget, 0)) * 100 >= v_threshold AS should_alert;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_budget_usage IS 'Calculate budget usage percentage with proper column aliases to avoid ambiguity';
