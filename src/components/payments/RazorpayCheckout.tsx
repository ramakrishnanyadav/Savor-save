import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { IndianMenuItem } from '@/types/indian-food';
import { formatPrice } from '@/data/indian-food-data';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RazorpayCheckoutProps {
  item: IndianMenuItem;
  quantity: number;
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: PaymentDetails) => void;
}

interface PaymentDetails {
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckout({ item, quantity, totalAmount, isOpen, onClose, onSuccess }: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout');
      }

      // Create order via edge function
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: totalAmount,
          currency: 'INR',
          receipt: `order_${item.id}_${Date.now()}`,
          notes: {
            itemId: item.id,
            itemName: item.nameEn,
            quantity: quantity,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }

      if (!data.orderId || !data.keyId) {
        throw new Error('Invalid response from server');
      }

      // Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Savor & Save',
        description: `Order: ${item.nameEn}`,
        order_id: data.orderId,
        handler: function (response: any) {
          setPaymentStatus('success');
          toast.success('Payment successful!');
          onSuccess({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            amount: totalAmount,
          });
          setTimeout(onClose, 2000);
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#f97316',
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('idle');
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        setPaymentStatus('error');
        setErrorMessage(response.error.description || 'Payment failed');
        setIsLoading(false);
        toast.error(response.error.description || 'Payment failed');
      });
      razorpay.open();
      setIsLoading(false);
    } catch (error: any) {
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Something went wrong');
      setIsLoading(false);
      toast.error(error.message || 'Payment initialization failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60]"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 m-auto w-[calc(100%-2rem)] max-w-md h-fit max-h-[85vh] bg-card rounded-3xl p-6 z-[60] shadow-2xl overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Complete Your Order</h2>
              <p className="text-muted-foreground text-sm mt-1">Secure payment via Razorpay</p>
            </div>

            {/* Order summary */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.nameEn}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.nameEn}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{item.region.replace('_', ' ')}</p>
                </div>
                <p className="font-bold text-lg">{formatPrice(item.price)}</p>
              </div>
            </div>

            {/* Payment status */}
            {paymentStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-green-500/10 text-green-600 rounded-xl mb-4"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Payment successful!</span>
              </motion.div>
            )}

            {paymentStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 text-red-600 rounded-xl mb-4"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={isLoading || paymentStatus === 'success'}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : paymentStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Order Placed!
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ₹{totalAmount.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By proceeding, you agree to our Terms & Conditions
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}