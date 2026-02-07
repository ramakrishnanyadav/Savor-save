import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Clock, MapPin, ChevronRight, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LiveOrderTracking } from '@/components/tracking/LiveOrderTracking';

interface UserOrder {
  id: string;
  order_number: string;
  restaurant_name: string;
  items: any[];
  total_amount: number;
  status: string;
  delivery_type: string;
  placed_at: string;
  estimated_delivery_time?: string;
}

export function UserOrdersView() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      // Build query - handle both authenticated and anonymous users
      let query = supabase
        .from('orders')
        .select('*');
      
      if (userData?.user) {
        // Authenticated user - show their orders
        query = query.eq('user_id', userData.user.id);
      } else {
        // Anonymous user - show orders with null user_id
        query = query.is('user_id', null);
      }
      
      query = query.order('placed_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching orders:', error);
        // Table might not exist yet
        if (error.message.includes('does not exist')) {
          console.warn('⚠️ Orders table not created yet. Please apply migration.');
          setOrders([]);
        } else {
          throw error;
        }
      } else {
        console.log(`✅ Fetched ${data?.length || 0} orders`);
        setOrders(data || []);
      }
    } catch (error) {
      console.error('❌ Error in fetchOrders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Listen for new orders
    const handleOrderCreated = () => {
      console.log('🔔 New order event, refreshing...');
      fetchOrders();
    };
    
    window.addEventListener('orderCreated', handleOrderCreated);
    
    // Real-time subscription
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('🔄 Real-time update:', payload);
          fetchOrders();
        }
      )
      .subscribe();
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
      channel.unsubscribe();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'order_received':
      case 'preparing': return 'bg-blue-500';
      case 'out_for_delivery':
      case 'nearby': return 'bg-purple-500';
      case 'cancelled':
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Package className="w-5 h-5" />;
      case 'out_for_delivery':
      case 'nearby': return <Truck className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Orders</h1>
            <p className="text-muted-foreground">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">
              Your orders will appear here after you place them
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold"
            >
              Browse Food
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-card border border-border shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg">#{order.order_number}</span>
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1',
                        getStatusColor(order.status)
                      )}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{order.restaurant_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.placed_at), 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>

                {/* Items */}
                <div className="mb-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{order.total_amount.toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                {!['delivered', 'cancelled', 'failed'].includes(order.status) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-5 h-5" />
                    Track Order
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Live Tracking Component */}
              <LiveOrderTracking
                orderId={selectedOrder.id}
                orderNumber={selectedOrder.order_number}
                restaurantName={selectedOrder.restaurant_name}
                items={selectedOrder.items || []}
                totalAmount={selectedOrder.total_amount || 0}
                estimatedTime={30}
                onClose={() => setSelectedOrder(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
