-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  city TEXT,
  state TEXT,
  dietary TEXT DEFAULT 'vegetarian',
  spice_level TEXT DEFAULT 'medium',
  regional_preferences TEXT[] DEFAULT ARRAY['north_indian', 'south_indian'],
  food_styles TEXT[] DEFAULT ARRAY['home_style', 'restaurant_style'],
  budget_min INTEGER DEFAULT 100,
  budget_max INTEGER DEFAULT 500,
  goals TEXT[] DEFAULT ARRAY['eat_healthier'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies - users can only access their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update food_orders to link to auth users
ALTER TABLE public.food_orders 
ADD CONSTRAINT food_orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies on food_orders
DROP POLICY IF EXISTS "Anyone can view food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Anyone can create food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Anyone can update their own food orders" ON public.food_orders;
DROP POLICY IF EXISTS "Anyone can delete food orders" ON public.food_orders;

-- Create secure policies for food_orders
CREATE POLICY "Users can view their own orders" 
ON public.food_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.food_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.food_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" 
ON public.food_orders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update user_budgets to link to auth users
ALTER TABLE public.user_budgets
ADD CONSTRAINT user_budgets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies on user_budgets
DROP POLICY IF EXISTS "Anyone can view user budgets" ON public.user_budgets;
DROP POLICY IF EXISTS "Anyone can create user budgets" ON public.user_budgets;
DROP POLICY IF EXISTS "Anyone can update user budgets" ON public.user_budgets;

-- Create secure policies for user_budgets
CREATE POLICY "Users can view their own budget" 
ON public.user_budgets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" 
ON public.user_budgets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget" 
ON public.user_budgets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup - creates profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();