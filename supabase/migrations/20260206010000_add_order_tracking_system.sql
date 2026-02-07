-- Migration: Add Order Tracking & Premium Features
-- Features: Order tracking, Delivery status, Location-based services, Product tracking

-- Create orders tracking table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_location TEXT,
  restaurant_distance DECIMAL(5,2), -- in km
  
  -- Order details
  items JSONB NOT NULL, -- Array of order items
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN (
    'placed', 'confirmed', 'preparing', 'ready', 'picked_up', 
    'on_the_way', 'nearby', 'delivered', 'cancelled', 'failed'
  )),
  
  -- Delivery tracking
  delivery_type TEXT DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup', 'dine-in')),
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  delivery_address TEXT,
  delivery_instructions TEXT,
  
  -- Delivery person tracking
  delivery_person_name TEXT,
  delivery_person_phone TEXT,
  delivery_person_location JSONB, -- {lat, lng}
  
  -- Customer info
  customer_name TEXT,
  customer_phone TEXT,
  customer_location JSONB, -- {lat, lng, address}
  
  -- Payment info
  payment_method TEXT DEFAULT 'online',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  transaction_id TEXT,
  
  -- Ratings & Review
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  review_images TEXT[],
  
  -- Timestamps
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  preparing_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  on_the_way_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation info
  cancellation_reason TEXT,
  cancelled_by TEXT, -- 'customer', 'restaurant', 'system'
  
  -- Metadata
  notes TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order status history table for tracking
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  location JSONB, -- {lat, lng}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delivery tracking table
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  accuracy DECIMAL(10,2),
  heading DECIMAL(5,2), -- Direction in degrees
  speed DECIMAL(5,2), -- Speed in km/h
  battery_level INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create restaurant locations table
CREATE TABLE IF NOT EXISTS public.restaurant_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id TEXT NOT NULL UNIQUE,
  restaurant_name TEXT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  
  -- Operating hours
  opening_time TIME,
  closing_time TIME,
  is_open BOOLEAN DEFAULT true,
  
  -- Delivery info
  avg_preparation_time INTEGER DEFAULT 20, -- in minutes
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  delivery_radius DECIMAL(5,2) DEFAULT 10, -- in km
  delivery_fee DECIMAL(10,2) DEFAULT 40,
  
  -- Ratings
  rating DECIMAL(3,2) DEFAULT 4.0,
  total_reviews INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer addresses table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- 'Home', 'Work', 'Other'
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for order_status_history
CREATE POLICY "Users can view order status history" 
ON public.order_status_history FOR SELECT 
USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

CREATE POLICY "System can insert order status history" 
ON public.order_status_history FOR INSERT 
WITH CHECK (true);

-- RLS Policies for delivery_tracking
CREATE POLICY "Users can view delivery tracking" 
ON public.delivery_tracking FOR SELECT 
USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- RLS Policies for restaurant_locations (public read)
CREATE POLICY "Anyone can view restaurant locations" 
ON public.restaurant_locations FOR SELECT 
USING (true);

-- RLS Policies for customer_addresses
CREATE POLICY "Users can manage their own addresses" 
ON public.customer_addresses FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON public.orders(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON public.delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_timestamp ON public.delivery_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_locations_id ON public.restaurant_locations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON public.customer_addresses(user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_locations_updated_at
BEFORE UPDATE ON public.restaurant_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at
BEFORE UPDATE ON public.customer_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- Earth radius in km
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN ROUND((earth_radius * c)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to estimate delivery time based on distance
CREATE OR REPLACE FUNCTION public.estimate_delivery_time(
  p_distance DECIMAL,
  p_preparation_time INTEGER DEFAULT 20
)
RETURNS INTEGER AS $$
DECLARE
  avg_speed DECIMAL := 30; -- Average delivery speed in km/h
  travel_time INTEGER;
  buffer_time INTEGER := 10; -- Buffer time in minutes
BEGIN
  -- Calculate travel time in minutes
  travel_time := CEIL((p_distance / avg_speed) * 60);
  
  -- Total time = preparation + travel + buffer
  RETURN p_preparation_time + travel_time + buffer_time;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get nearby restaurants
CREATE OR REPLACE FUNCTION public.get_nearby_restaurants(
  p_user_lat DECIMAL,
  p_user_lon DECIMAL,
  p_max_distance DECIMAL DEFAULT 10
)
RETURNS TABLE (
  restaurant_id TEXT,
  restaurant_name TEXT,
  address TEXT,
  distance DECIMAL,
  estimated_delivery_minutes INTEGER,
  delivery_fee DECIMAL,
  rating DECIMAL,
  is_open BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rl.restaurant_id,
    rl.restaurant_name,
    rl.address,
    calculate_distance(p_user_lat, p_user_lon, rl.latitude, rl.longitude) as distance,
    estimate_delivery_time(
      calculate_distance(p_user_lat, p_user_lon, rl.latitude, rl.longitude),
      rl.avg_preparation_time
    ) as estimated_delivery_minutes,
    rl.delivery_fee,
    rl.rating,
    rl.is_open
  FROM public.restaurant_locations rl
  WHERE calculate_distance(p_user_lat, p_user_lon, rl.latitude, rl.longitude) <= p_max_distance
    AND rl.is_open = true
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to update order status with history
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_message TEXT DEFAULT NULL,
  p_location JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  -- Get current status
  SELECT status INTO v_old_status FROM public.orders WHERE id = p_order_id;
  
  -- Update order status and timestamp
  UPDATE public.orders
  SET 
    status = p_new_status,
    confirmed_at = CASE WHEN p_new_status = 'confirmed' THEN now() ELSE confirmed_at END,
    preparing_at = CASE WHEN p_new_status = 'preparing' THEN now() ELSE preparing_at END,
    ready_at = CASE WHEN p_new_status = 'ready' THEN now() ELSE ready_at END,
    picked_up_at = CASE WHEN p_new_status = 'picked_up' THEN now() ELSE picked_up_at END,
    on_the_way_at = CASE WHEN p_new_status = 'on_the_way' THEN now() ELSE on_the_way_at END,
    delivered_at = CASE WHEN p_new_status = 'delivered' THEN now() ELSE delivered_at END,
    cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
    updated_at = now()
  WHERE id = p_order_id;
  
  -- Insert status history
  INSERT INTO public.order_status_history (order_id, status, message, location)
  VALUES (p_order_id, p_new_status, p_message, p_location);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_date TEXT;
  v_count INTEGER;
  v_order_number TEXT;
BEGIN
  v_date := TO_CHAR(now(), 'YYYYMMDD');
  
  SELECT COUNT(*) INTO v_count
  FROM public.orders
  WHERE order_number LIKE v_date || '%';
  
  v_order_number := v_date || LPAD((v_count + 1)::TEXT, 4, '0');
  
  RETURN v_order_number;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.orders IS 'Main orders table with tracking information';
COMMENT ON TABLE public.order_status_history IS 'History of all order status changes';
COMMENT ON TABLE public.delivery_tracking IS 'Real-time delivery person location tracking';
COMMENT ON TABLE public.restaurant_locations IS 'Restaurant locations and delivery information';
COMMENT ON TABLE public.customer_addresses IS 'Customer saved addresses';

COMMENT ON FUNCTION public.calculate_distance IS 'Calculate distance between two coordinates using Haversine formula';
COMMENT ON FUNCTION public.estimate_delivery_time IS 'Estimate delivery time based on distance and preparation time';
COMMENT ON FUNCTION public.get_nearby_restaurants IS 'Get restaurants within specified radius sorted by distance';
COMMENT ON FUNCTION public.update_order_status IS 'Update order status and maintain history';
COMMENT ON FUNCTION public.generate_order_number IS 'Generate unique order number based on date';
