import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Order,
  OrderStatus,
  OrderStatusHistory,
  DeliveryTracking,
  RestaurantLocation,
  NearbyRestaurant,
  CustomerAddress,
  CreateOrderInput,
  UpdateOrderStatusInput,
  RateOrderInput,
  OrderTrackingState,
  Location,
} from '@/types/order-tracking';

// Helper to map database row to Order
function mapDbToOrder(row: Record<string, any>): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name,
    restaurantLocation: row.restaurant_location,
    restaurantDistance: row.restaurant_distance ? Number(row.restaurant_distance) : undefined,
    items: row.items,
    totalAmount: Number(row.total_amount),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    taxAmount: Number(row.tax_amount),
    discountAmount: Number(row.discount_amount),
    status: row.status,
    deliveryType: row.delivery_type,
    estimatedDeliveryTime: row.estimated_delivery_time ? new Date(row.estimated_delivery_time) : undefined,
    actualDeliveryTime: row.actual_delivery_time ? new Date(row.actual_delivery_time) : undefined,
    deliveryAddress: row.delivery_address,
    deliveryInstructions: row.delivery_instructions,
    deliveryPersonName: row.delivery_person_name,
    deliveryPersonPhone: row.delivery_person_phone,
    deliveryPersonLocation: row.delivery_person_location,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerLocation: row.customer_location,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paymentId: row.payment_id,
    transactionId: row.transaction_id,
    rating: row.rating,
    review: row.review,
    reviewImages: row.review_images,
    placedAt: new Date(row.placed_at),
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : undefined,
    preparingAt: row.preparing_at ? new Date(row.preparing_at) : undefined,
    readyAt: row.ready_at ? new Date(row.ready_at) : undefined,
    pickedUpAt: row.picked_up_at ? new Date(row.picked_up_at) : undefined,
    onTheWayAt: row.on_the_way_at ? new Date(row.on_the_way_at) : undefined,
    deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : undefined,
    cancellationReason: row.cancellation_reason,
    cancelledBy: row.cancelled_by,
    notes: row.notes,
    specialInstructions: row.special_instructions,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function useOrderTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistory[]>([]);
  const [deliveryTracking, setDeliveryTracking] = useState<DeliveryTracking[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyRestaurant[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Build query - filter by user_id if authenticated
      let query = supabase
        .from('orders')
        .select('*');
      
      // If user is authenticated, filter by their user_id
      // If not authenticated, get orders where user_id is null
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.is('user_id', null);
      }
      
      // Add ordering at the end
      query = query.order('placed_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        // Don't show error toast if it's just an empty result
        if (error.code !== 'PGRST116') {
          toast.error('Failed to load orders');
        }
        setOrders([]);
        return;
      }

      const mappedOrders = (data || []).map(mapDbToOrder);
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get nearby restaurants based on user location
  const getNearbyRestaurants = useCallback(async (userLat: number, userLon: number, maxDistance: number = 10) => {
    try {
      const { data, error } = await supabase.rpc('get_nearby_restaurants', {
        p_user_lat: userLat,
        p_user_lon: userLon,
        p_max_distance: maxDistance,
      });

      if (error) throw error;

      setNearbyRestaurants(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      toast.error('Failed to load nearby restaurants');
      return [];
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (input: CreateOrderInput): Promise<Order | null> => {
    try {
      setIsLoading(true);

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase.rpc('generate_order_number');
      if (orderNumberError) throw orderNumberError;

      const orderNumber = orderNumberData as string;

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryFee = input.deliveryType === 'delivery' ? 40 : 0;
      const taxAmount = subtotal * 0.05; // 5% tax
      const totalAmount = subtotal + deliveryFee + taxAmount;

      // Estimate delivery time
      let estimatedDeliveryTime = null;
      if (input.deliveryType === 'delivery' && input.customerLocation) {
        // Get restaurant location
        const { data: restaurantData } = await supabase
          .from('restaurant_locations')
          .select('*')
          .eq('restaurant_id', input.restaurantId)
          .single();

        if (restaurantData) {
          const { data: timeData } = await supabase.rpc('estimate_delivery_time', {
            p_distance: await calculateDistance(
              input.customerLocation.lat,
              input.customerLocation.lng,
              restaurantData.latitude,
              restaurantData.longitude
            ),
            p_preparation_time: restaurantData.avg_preparation_time,
          });

          if (timeData) {
            estimatedDeliveryTime = new Date(Date.now() + timeData * 60000);
          }
        }
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null, // Set to null if not authenticated
          order_number: orderNumber,
          restaurant_id: input.restaurantId,
          restaurant_name: input.restaurantName,
          items: input.items,
          subtotal,
          delivery_fee: deliveryFee,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          delivery_type: input.deliveryType,
          delivery_address: input.deliveryAddress,
          delivery_instructions: input.deliveryInstructions,
          customer_location: input.customerLocation,
          payment_method: input.paymentMethod,
          special_instructions: input.specialInstructions,
          estimated_delivery_time: estimatedDeliveryTime,
          status: 'placed',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const newOrder = mapDbToOrder(data);
      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);

      // Create initial status history
      await supabase.rpc('update_order_status', {
        p_order_id: newOrder.id,
        p_new_status: 'placed',
        p_message: 'Order placed successfully',
      });

      toast.success(`Order ${orderNumber} placed successfully!`);
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (input: UpdateOrderStatusInput) => {
    try {
      const { data, error } = await supabase.rpc('update_order_status', {
        p_order_id: input.orderId,
        p_new_status: input.newStatus,
        p_message: input.message,
        p_location: input.location,
      });

      if (error) throw error;

      // Refresh orders
      await fetchOrders();

      toast.success(`Order status updated to ${input.newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  }, [fetchOrders]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    try {
      await updateOrderStatus({
        orderId,
        newStatus: 'cancelled',
        message: reason,
      });

      await supabase
        .from('orders')
        .update({
          cancellation_reason: reason,
          cancelled_by: 'customer',
        })
        .eq('id', orderId);

      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  }, [updateOrderStatus]);

  // Rate order
  const rateOrder = useCallback(async (input: RateOrderInput) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          rating: input.rating,
          review: input.review,
          review_images: input.reviewImages,
        })
        .eq('id', input.orderId);

      if (error) throw error;

      await fetchOrders();
      toast.success('Thank you for your review!');
    } catch (error) {
      console.error('Error rating order:', error);
      toast.error('Failed to submit rating');
    }
  }, [fetchOrders]);

  // Get order tracking state
  const getOrderTrackingState = useCallback((order: Order): OrderTrackingState => {
    const statusOrder: OrderStatus[] = [
      'placed',
      'confirmed',
      'preparing',
      'ready',
      'picked_up',
      'on_the_way',
      'nearby',
      'delivered',
    ];

    const currentIndex = statusOrder.indexOf(order.status);
    const progressPercentage = ((currentIndex + 1) / statusOrder.length) * 100;

    const canCancel = ['placed', 'confirmed'].includes(order.status);
    const canRate = order.status === 'delivered' && !order.rating;

    let estimatedTime: number | undefined;
    if (order.estimatedDeliveryTime && order.status !== 'delivered') {
      const remaining = order.estimatedDeliveryTime.getTime() - Date.now();
      estimatedTime = Math.max(0, Math.ceil(remaining / 60000)); // minutes
    }

    return {
      currentStatus: order.status,
      statusHistory: orderHistory,
      estimatedTime,
      isDelivered: order.status === 'delivered',
      isCancelled: order.status === 'cancelled',
      canCancel,
      canRate,
      deliveryPersonLocation: order.deliveryPersonLocation,
      progressPercentage,
    };
  }, [orderHistory]);

  // Calculate distance between two coordinates
  const calculateDistance = async (lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('calculate_distance', {
        lat1,
        lon1,
        lat2,
        lon2,
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 0;
    }
  };

  // Setup realtime subscriptions
  useEffect(() => {
    fetchOrders();

    // Subscribe to order updates
    const orderChannel = supabase
      .channel('order_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updatedOrder = mapDbToOrder(payload.new);
            setOrders(prev => {
              const index = prev.findIndex(o => o.id === updatedOrder.id);
              if (index >= 0) {
                const newOrders = [...prev];
                newOrders[index] = updatedOrder;
                return newOrders;
              }
              return [updatedOrder, ...prev];
            });

            if (activeOrder?.id === updatedOrder.id) {
              setActiveOrder(updatedOrder);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
    };
  }, [fetchOrders]);

  return {
    orders,
    activeOrder,
    orderHistory,
    deliveryTracking,
    nearbyRestaurants,
    customerAddresses,
    isLoading,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    rateOrder,
    getNearbyRestaurants,
    getOrderTrackingState,
    calculateDistance,
    setActiveOrder,
    refetch: fetchOrders,
  };
}
