-- Create food_orders table to store order history
CREATE TABLE public.food_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  food_id TEXT,
  food_name TEXT NOT NULL,
  restaurant TEXT,
  category TEXT NOT NULL CHECK (category IN ('dine-in', 'delivery', 'takeout', 'home-cooked', 'street-food')),
  amount DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  cuisine TEXT,
  notes TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_budgets table to store budget settings
CREATE TABLE public.user_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  monthly_budget DECIMAL(10,2) NOT NULL DEFAULT 10000,
  weekly_budget DECIMAL(10,2) NOT NULL DEFAULT 2500,
  daily_budget DECIMAL(10,2) NOT NULL DEFAULT 400,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for food_orders - Allow public access for now (no auth required)
CREATE POLICY "Anyone can view food orders" 
ON public.food_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create food orders" 
ON public.food_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their own food orders" 
ON public.food_orders 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete food orders" 
ON public.food_orders 
FOR DELETE 
USING (true);

-- Create policies for user_budgets - Allow public access for now (no auth required)
CREATE POLICY "Anyone can view user budgets" 
ON public.user_budgets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create user budgets" 
ON public.user_budgets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update user budgets" 
ON public.user_budgets 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_food_orders_updated_at
BEFORE UPDATE ON public.food_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_budgets_updated_at
BEFORE UPDATE ON public.user_budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_food_orders_order_date ON public.food_orders(order_date DESC);
CREATE INDEX idx_food_orders_meal_type ON public.food_orders(meal_type);
CREATE INDEX idx_food_orders_category ON public.food_orders(category);