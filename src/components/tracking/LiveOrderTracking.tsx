import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, CheckCircle, Clock, Truck, Home, 
  MapPin, Phone, User, ChevronRight, Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type OrderStatus = 
  | 'order_received' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'nearby' 
  | 'delivered';

interface OrderTrackingProps {
  orderId: string;
  orderNumber?: string;
  restaurantName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  estimatedTime: number; // in minutes
  onClose?: () => void;
}

export function LiveOrderTracking({
  orderId,
  orderNumber,
  restaurantName,
  items = [],
  totalAmount = 0,
  estimatedTime = 30,
  onClose,
}: OrderTrackingProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('order_received');
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [isCancelled, setIsCancelled] = useState(false);
  const [deliveryPerson, setDeliveryPerson] = useState({
    name: 'Raj Kumar',
    phone: '+91 98765 43210',
    rating: 4.8,
  });

  // Fetch actual order status from database
  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        if (error) {
          console.error('Error fetching order status:', error);
          return;
        }

        if (data && data.status === 'cancelled') {
          setIsCancelled(true);
          setCurrentStatus('delivered' as OrderStatus); // Stop animation
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchOrderStatus();
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { toast } = await import('sonner');
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error cancelling order:', error);
        toast.error('Failed to cancel order');
        return;
      }

      toast.success('Order cancelled successfully');
      setIsCancelled(true); // Show cancelled view
      
      // Refresh after 2 seconds to show cancelled state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const statusSteps = [
    {
      status: 'order_received' as OrderStatus,
      title: 'Order Received',
      description: 'Restaurant confirmed your order',
      icon: Package,
      color: 'blue',
      time: '1 min ago',
    },
    {
      status: 'preparing' as OrderStatus,
      title: 'Preparing',
      description: 'Chef is cooking your food',
      icon: Clock,
      color: 'orange',
      time: 'In progress',
    },
    {
      status: 'ready' as OrderStatus,
      title: 'Ready for Pickup',
      description: 'Food is packed and ready',
      icon: CheckCircle,
      color: 'green',
      time: 'Waiting',
    },
    {
      status: 'out_for_delivery' as OrderStatus,
      title: 'Out for Delivery',
      description: 'Delivery partner picked up',
      icon: Truck,
      color: 'purple',
      time: 'On the way',
    },
    {
      status: 'nearby' as OrderStatus,
      title: 'Nearby',
      description: 'Driver is 2 minutes away',
      icon: MapPin,
      color: 'pink',
      time: '2 min',
    },
    {
      status: 'delivered' as OrderStatus,
      title: 'Delivered',
      description: 'Enjoy your meal!',
      icon: Home,
      color: 'emerald',
      time: 'Completed',
    },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === currentStatus);
  const progressPercentage = ((currentStepIndex + 1) / statusSteps.length) * 100;

  // Simulate order progression (for demo)
  useEffect(() => {
    const statusSequence: OrderStatus[] = [
      'order_received',
      'preparing',
      'ready',
      'out_for_delivery',
      'nearby',
      'delivered',
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < statusSequence.length - 1) {
        currentIndex++;
        setCurrentStatus(statusSequence[currentIndex]);
      } else {
        clearInterval(interval);
      }
    }, 8000); // Change status every 8 seconds for demo

    return () => clearInterval(interval);
  }, []);

  // Update time remaining
  useEffect(() => {
    if (currentStatus === 'delivered') {
      setTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentStatus]);

  const getStatusColor = (status: OrderStatus) => {
    const step = statusSteps.find(s => s.status === status);
    return step?.color || 'blue';
  };

  // Show cancelled state
  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6 py-6">
          {/* Cancelled Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Order Cancelled</h2>
            <p className="text-lg opacity-90">This order has been cancelled</p>
            {orderNumber && (
              <p className="mt-4 text-sm opacity-75">Order #{orderNumber}</p>
            )}
          </motion.div>

          {/* Order Details (read-only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-card border border-border shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 text-muted-foreground">Order Details</h3>
            
            <div className="mb-4 pb-4 border-b border-border">
              <h4 className="font-medium text-lg text-muted-foreground">{restaurantName}</h4>
            </div>

            <div className="space-y-3 mb-4 opacity-60">
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{item.quantity}x</span>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-muted-foreground">₹{(item.price || 0).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm">No items to display</div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-muted-foreground">Total Amount</span>
                <span className="font-bold text-2xl text-muted-foreground">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🚚 Track Your Order</h1>
          <p className="text-muted-foreground">Order #{orderId}</p>
        </div>

        {/* Current Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'mb-6 p-6 rounded-3xl text-white shadow-xl',
            `bg-gradient-to-br from-${getStatusColor(currentStatus)}-500 to-${getStatusColor(currentStatus)}-600`
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {statusSteps[currentStepIndex] && (
                <>
                  <div className="p-4 rounded-2xl bg-white/20">
                    {React.createElement(statusSteps[currentStepIndex].icon, {
                      className: 'w-8 h-8',
                    })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {statusSteps[currentStepIndex].title}
                    </h2>
                    <p className="opacity-90">
                      {statusSteps[currentStepIndex].description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {currentStatus !== 'delivered' && timeRemaining > 0 && (
            <div className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                Estimated time: {timeRemaining} minutes
              </span>
            </div>
          )}
        </motion.div>

        {/* Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
        >
          <h3 className="font-semibold text-lg mb-6">Order Progress</h3>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
            <motion.div
              className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500"
              initial={{ height: 0 }}
              animate={{ height: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />

            {/* Steps */}
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <motion.div
                    key={step.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'relative z-10 p-3 rounded-full transition-all',
                        isCompleted
                          ? `bg-${step.color}-500 text-white`
                          : 'bg-muted text-muted-foreground',
                        isCurrent && 'ring-4 ring-white shadow-xl scale-110'
                      )}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={cn(
                            'font-semibold text-lg',
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {step.title}
                        </h4>
                        <span
                          className={cn(
                            'text-sm',
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {step.time}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>

                      {isCurrent && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-500"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          Current Status
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Delivery Person Info */}
        {(currentStatus === 'out_for_delivery' || currentStatus === 'nearby') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
          >
            <h3 className="font-semibold text-lg mb-4">Delivery Partner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/10">
                  <User className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{deliveryPerson.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{deliveryPerson.rating} Rating</span>
                  </div>
                </div>
              </div>
              <a
                href={`tel:${deliveryPerson.phone}`}
                className="p-4 rounded-2xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
              >
                <Phone className="w-6 h-6 text-green-500" />
              </a>
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
        >
          <h3 className="font-semibold text-lg mb-4">Order Details</h3>
          
          <div className="mb-4 pb-4 border-b border-border">
            <h4 className="font-medium text-lg">{restaurantName}</h4>
          </div>

          <div className="space-y-3 mb-4">
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">₹{(item.price || 0).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">No items to display</div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Total Amount</span>
              <span className="font-bold text-2xl text-primary">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Cancel Order (only if not delivered/cancelled) */}
        {!['delivered', 'cancelled'].includes(currentStatus) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  handleCancelOrder();
                }
              }}
              className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
            >
              Cancel Order
            </button>
          </motion.div>
        )}

        {/* Rate Order (only when delivered) */}
        {currentStatus === 'delivered' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-2">🎉 Order Delivered!</h3>
            <p className="mb-4 opacity-90">How was your experience?</p>
            <button className="w-full py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:shadow-lg transition-all">
              Rate Your Order
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
