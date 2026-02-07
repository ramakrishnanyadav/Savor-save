-- Fix Order Tracking RLS Policies to Support Both Authenticated and Anonymous Users
-- This migration updates the RLS policies to allow the app to work without authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Create new flexible policies that work with or without authentication
CREATE POLICY "Anyone can view orders" 
ON public.orders FOR SELECT 
USING (
  -- Allow if authenticated and owns the order
  (auth.uid() = user_id) 
  OR 
  -- Allow if not authenticated (user_id is null)
  (auth.uid() IS NULL AND user_id IS NULL)
  OR
  -- Allow all for anonymous access
  (user_id IS NULL)
);

CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (
  -- Allow if authenticated and creating own order
  (auth.uid() = user_id)
  OR
  -- Allow if not authenticated
  (auth.uid() IS NULL)
);

CREATE POLICY "Anyone can update orders" 
ON public.orders FOR UPDATE 
USING (
  -- Allow if authenticated and owns the order
  (auth.uid() = user_id)
  OR
  -- Allow if not authenticated
  (auth.uid() IS NULL AND user_id IS NULL)
  OR
  -- Allow all updates to null user_id orders
  (user_id IS NULL)
);

-- Update order_status_history policies
DROP POLICY IF EXISTS "Users can view order status history" ON public.order_status_history;
DROP POLICY IF EXISTS "System can insert order status history" ON public.order_status_history;

CREATE POLICY "Anyone can view order status history" 
ON public.order_status_history FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert order status history" 
ON public.order_status_history FOR INSERT 
WITH CHECK (true);

-- Update delivery_tracking policies
DROP POLICY IF EXISTS "Users can view delivery tracking" ON public.delivery_tracking;

CREATE POLICY "Anyone can view delivery tracking" 
ON public.delivery_tracking FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert delivery tracking" 
ON public.delivery_tracking FOR INSERT 
WITH CHECK (true);

-- Make user_id nullable in orders table (if not already)
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment
COMMENT ON TABLE public.orders IS 'Orders table with flexible authentication - supports both authenticated and anonymous users';
