-- Enable realtime for food_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_orders;

-- Enable replica identity for complete row data on updates
ALTER TABLE public.food_orders REPLICA IDENTITY FULL;