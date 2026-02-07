import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Check } from 'lucide-react';
import { expenseCategories, paymentMethods, cuisineCategories } from '@/data/mockData';
import { cn, formatIndianNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: any) => void;
}

export function AddExpenseModal({ isOpen, onClose, onAdd }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [isSplitBill, setIsSplitBill] = useState(false);
  const [splitPeople, setSplitPeople] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus amount input when modal opens
      setTimeout(() => amountInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !restaurant) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const expenseDate = new Date(`${date}T${time}`);
    
    const expense = {
      amount: parseFloat(amount),
      category,
      cuisine: cuisine || 'Other',
      restaurant,
      date: expenseDate,
      paymentMethod,
      notes,
      splitBill: isSplitBill ? {
        total: parseFloat(amount),
        people: splitPeople,
        yourShare: parseFloat(amount) / splitPeople,
      } : undefined,
    };

    onAdd(expense);
    setIsSuccess(true);
    toast.success('✅ Expense added successfully!');
    
    setTimeout(() => {
      setIsSuccess(false);
      setIsSubmitting(false);
      resetForm();
      onClose();
    }, 800);
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setCuisine('');
    setRestaurant('');
    setPaymentMethod('UPI');
    setNotes('');
    setIsSplitBill(false);
    setSplitPeople(2);
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop - Full screen dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.25 }}
            className="relative z-10 w-[95vw] max-w-xl max-h-[90vh] m-4"
          >
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border">
              {/* Header - Fixed */}
              <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
                <h2 className="text-2xl font-bold text-foreground">Add Expense</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
                <div className="p-6 space-y-6">
                  {/* Amount Input - LARGE and PROMINENT */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Amount *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-primary">₹</span>
                      <input
                        ref={amountInputRef}
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        required
                        min="1"
                        max="100000"
                        className="w-full pl-14 pr-4 py-4 text-3xl font-bold rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                    {amount && parseFloat(amount) > 0 && (
                      <p className="text-sm text-muted-foreground">
                        ₹{formatIndianNumber(parseFloat(amount))}
                      </p>
                    )}
                  </div>

                  {/* Category Selection - Icon Grid */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Category *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {expenseCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setCategory(cat.label)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                            category === cat.label
                              ? 'border-primary bg-primary/10 shadow-md'
                              : 'border-border bg-muted/30 hover:border-primary/50'
                          )}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="text-xs font-medium text-center leading-tight text-foreground">{cat.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Restaurant/Vendor Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Restaurant/Vendor *</label>
                    <input
                      type="text"
                      value={restaurant}
                      onChange={(e) => setRestaurant(e.target.value)}
                      placeholder="Where did you eat?"
                      required
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Cuisine Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Cuisine</label>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                    >
                      <option value="">Select cuisine</option>
                      {cuisineCategories.sort().map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Date *</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Time *</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <div className="grid grid-cols-4 gap-2">
                      {paymentMethods.map((method) => (
                        <motion.button
                          key={method}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            'py-3 rounded-xl border-2 text-sm font-medium transition-all',
                            paymentMethod === method
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50 text-foreground'
                          )}
                        >
                          {method}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Split Bill Toggle */}
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Split Bill?</p>
                          <p className="text-sm text-muted-foreground">Divide between friends</p>
                        </div>
                      </div>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSplitBill(!isSplitBill)}
                        className={cn(
                          'w-14 h-7 rounded-full transition-colors relative',
                          isSplitBill ? 'bg-primary' : 'bg-muted-foreground/30'
                        )}
                      >
                        <motion.div
                          animate={{ x: isSplitBill ? 28 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-5 h-5 rounded-full bg-white shadow-md absolute top-1"
                        />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {isSplitBill && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-muted-foreground">Number of people (2-20)</span>
                            <div className="flex items-center gap-3">
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSplitPeople(Math.max(2, splitPeople - 1))}
                                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted text-foreground"
                              >
                                -
                              </motion.button>
                              <span className="font-bold text-lg w-8 text-center text-foreground">{splitPeople}</span>
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSplitPeople(Math.min(20, splitPeople + 1))}
                                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted text-foreground"
                              >
                                +
                              </motion.button>
                            </div>
                          </div>
                          {amount && parseFloat(amount) > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <div className="flex justify-between text-sm">
                                <span>Total: <span className="font-bold">₹{formatIndianNumber(parseFloat(amount))}</span></span>
                                <span>Per person: <span className="font-bold">₹{formatIndianNumber(parseFloat(amount) / splitPeople)}</span></span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-muted-foreground">Notes (optional)</label>
                      <span className="text-xs text-muted-foreground">{notes.length}/200</span>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                      placeholder="Add any additional details..."
                      rows={3}
                      maxLength={200}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Footer - Action Buttons - Fixed at bottom */}
                <div className="sticky bottom-0 bg-card border-t border-border p-4 md:p-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 border-2 border-border rounded-xl font-medium hover:bg-muted transition-all text-foreground"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!amount || !category || !restaurant || isSubmitting}
                    className={cn(
                      'flex-1 px-6 py-3 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2',
                      isSuccess
                        ? 'bg-emerald-500 text-white'
                        : 'gradient-bg text-white shadow-glow',
                      (!amount || !category || !restaurant) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isSuccess ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Saved!
                      </motion.div>
                    ) : isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Add Expense
                        {amount && parseFloat(amount) > 0 && (
                          <span className="opacity-80">• ₹{formatIndianNumber(parseFloat(amount))}</span>
                        )}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
