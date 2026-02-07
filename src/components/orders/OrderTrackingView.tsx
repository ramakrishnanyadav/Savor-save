import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, CheckCircle, Clock, Truck, MapPin, Phone,
  Star, ChevronRight, X, MessageCircle, AlertCircle,
  Navigation, Home, Utensils, User
} from 'lucide-react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Order, OrderStatus } from '@/types/order-tracking';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderTrackingViewProps {
  orderId?: string;
}

export function OrderTrackingView({ orderId }: OrderTrackingViewProps) {
  const {
    orders,
    activeOrder,
    isLoading,
    getOrderTrackingState,
    cancelOrder,
    rateOrder,
    setActiveOrder,
  } = useOrderTracking();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) setActiveOrder(order);
    } else if (orders.length > 0 && !activeOrder) {
      // Set most recent active order
      const active = orders.find(o => 
        !['delivered', 'cancelled', 'failed'].includes(o.status)
      );
      setActiveOrder(active || orders[0]);
    }
  }, [orderId, orders, activeOrder, setActiveOrder]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Active Orders</h2>
          <p className="text-muted-foreground">You don't have any orders yet.</p>
        </div>
      </div>
    );
  }

  const trackingState = getOrderTrackingState(activeOrder);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return <Package className="w-6 h-6" />;
      case 'confirmed': return <CheckCircle className="w-6 h-6" />;
      case 'preparing': return <Utensils className="w-6 h-6" />;
      case 'ready': return <CheckCircle className="w-6 h-6" />;
      case 'picked_up': return <Truck className="w-6 h-6" />;
      case 'on_the_way': return <Navigation className="w-6 h-6" />;
      case 'nearby': return <MapPin className="w-6 h-6" />;
      case 'delivered': return <Home className="w-6 h-6" />;
      case 'cancelled': return <X className="w-6 h-6" />;
      case 'failed': return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered': return 'text-green-500 bg-green-500/10';
      case 'cancelled':
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'on_the_way':
      case 'nearby': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-orange-500 bg-orange-500/10';
    }
  };

  const statusSteps = [
    { status: 'placed', label: 'Order Placed', time: activeOrder.placedAt },
    { status: 'confirmed', label: 'Confirmed', time: activeOrder.confirmedAt },
    { status: 'preparing', label: 'Preparing', time: activeOrder.preparingAt },
    { status: 'ready', label: 'Ready', time: activeOrder.readyAt },
    { status: 'picked_up', label: 'Picked Up', time: activeOrder.pickedUpAt },
    { status: 'on_the_way', label: 'On the Way', time: activeOrder.onTheWayAt },
    { status: 'delivered', label: 'Delivered', time: activeOrder.deliveredAt },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === activeOrder.status);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    await cancelOrder(activeOrder.id, cancelReason);
    setShowCancelDialog(false);
    setCancelReason('');
  };

  const handleRateOrder = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    await rateOrder({
      orderId: activeOrder.id,
      rating,
      review: review.trim() || undefined,
    });
    setShowRatingDialog(false);
    setRating(0);
    setReview('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Order #{activeOrder.orderNumber}</p>
        </div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mb-6 p-6 rounded-3xl flex items-center justify-between',
            getStatusColor(activeOrder.status)
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn('p-4 rounded-2xl', getStatusColor(activeOrder.status))}>
              {getStatusIcon(activeOrder.status)}
            </div>
            <div>
              <h2 className="text-2xl font-bold capitalize">
                {activeOrder.status.replace('_', ' ')}
              </h2>
              {trackingState.estimatedTime && trackingState.estimatedTime > 0 && (
                <p className="text-sm opacity-80 flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  Estimated: {trackingState.estimatedTime} mins
                </p>
              )}
            </div>
          </div>
          
          {trackingState.canCancel && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-semibold"
            >
              Cancel Order
            </button>
          )}
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
        >
          <h3 className="font-semibold mb-6">Order Progress</h3>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
            <div 
              className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
              style={{ height: `${trackingState.progressPercentage}%` }}
            />

            {/* Status Steps */}
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'relative z-10 p-3 rounded-full transition-all',
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {getStatusIcon(step.status as OrderStatus)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          'font-semibold',
                          isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {step.label}
                        </h4>
                        {step.time && (
                          <span className="text-sm text-muted-foreground">
                            {format(step.time, 'hh:mm a')}
                          </span>
                        )}
                      </div>
                      {isCurrent && trackingState.estimatedTime && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Estimated: {trackingState.estimatedTime} mins remaining
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
        >
          <h3 className="font-semibold mb-4">Restaurant Details</h3>
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-orange-500/10">
              <Utensils className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{activeOrder.restaurantName}</h4>
              {activeOrder.restaurantLocation && (
                <p className="text-sm text-muted-foreground mt-1">
                  {activeOrder.restaurantLocation}
                </p>
              )}
              {activeOrder.restaurantDistance && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {activeOrder.restaurantDistance} km away
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Delivery Person Info */}
        {activeOrder.deliveryPersonName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
          >
            <h3 className="font-semibold mb-4">Delivery Partner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/10">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{activeOrder.deliveryPersonName}</h4>
                  {activeOrder.deliveryPersonPhone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="w-4 h-4" />
                      {activeOrder.deliveryPersonPhone}
                    </p>
                  )}
                </div>
              </div>
              
              {activeOrder.deliveryPersonPhone && (
                <a
                  href={`tel:${activeOrder.deliveryPersonPhone}`}
                  className="p-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
        >
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {activeOrder.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">{item.quantity}x</span>
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    {item.customizations && item.customizations.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {item.customizations.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-semibold">₹{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Bill Summary */}
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{activeOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>₹{activeOrder.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{activeOrder.taxAmount.toFixed(2)}</span>
            </div>
            {activeOrder.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-500">
                <span>Discount</span>
                <span>-₹{activeOrder.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{activeOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Rate Order Button */}
        {trackingState.canRate && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setShowRatingDialog(true)}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Star className="w-5 h-5" />
            Rate Your Experience
          </motion.button>
        )}
      </div>

      {/* Cancel Dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <>
            <motion.div
              key="cancel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelDialog(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              key="cancel-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 m-auto w-full max-w-md h-fit bg-card rounded-3xl p-6 z-50 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">Cancel Order?</h3>
              <p className="text-muted-foreground mb-4">
                Please tell us why you want to cancel this order.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none resize-none mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-semibold"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rating Dialog */}
      <AnimatePresence>
        {showRatingDialog && (
          <>
            <motion.div
              key="rating-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingDialog(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              key="rating-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 m-auto w-full max-w-md h-fit bg-card rounded-3xl p-6 z-50 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">Rate Your Order</h3>
              
              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'w-10 h-10',
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
              
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review (optional)..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none resize-none mb-4"
                rows={4}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRatingDialog(false)}
                  className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-semibold"
                >
                  Skip
                </button>
                <button
                  onClick={handleRateOrder}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all font-semibold"
                >
                  Submit Rating
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
