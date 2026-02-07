import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, TrendingUp, Users, Calendar, DollarSign, FileText, Hash } from 'lucide-react';
import { FoodExpense, TransactionType, SplitShare } from '@/types/expense';
import { toast } from 'sonner';

interface AddExpenseModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<FoodExpense, 'id'>) => void;
  canAddExpense: (amount: number) => Promise<{ allowed: boolean; message?: string }>;
  splitExpenseEqually: (totalAmount: number, people: number) => SplitShare[];
}

export function AddExpenseModalNew({
  isOpen,
  onClose,
  onAdd,
  canAddExpense,
  splitExpenseEqually,
}: AddExpenseModalNewProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [foodName, setFoodName] = useState('');
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<FoodExpense['mealType']>('lunch');
  const [category, setCategory] = useState<FoodExpense['category']>('dine-in');
  
  // Split expense fields
  const [splitPeople, setSplitPeople] = useState('2');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'manual'>('equal');
  const [manualShares, setManualShares] = useState<SplitShare[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!foodName.trim()) {
      toast.error('Please enter a description');
      return;
    }

    // Check budget if it's an expense
    if (transactionType === 'expense' || transactionType === 'split') {
      const check = await canAddExpense(amountNum);
      if (!check.allowed) {
        const confirmed = window.confirm(
          `⚠️ Budget Warning\n\n${check.message}\n\nDo you still want to add this expense?`
        );
        if (!confirmed) return;
      }
    }

    // Calculate split if needed
    let splitShares: SplitShare[] | undefined;
    let finalAmount = amountNum;
    
    if (transactionType === 'split') {
      const people = parseInt(splitPeople);
      if (isNaN(people) || people < 2) {
        toast.error('Split must be between at least 2 people');
        return;
      }

      if (splitMethod === 'equal') {
        splitShares = splitExpenseEqually(amountNum, people);
        // Your share is the first person
        finalAmount = splitShares[0].amount;
      } else {
        // Manual split
        if (manualShares.length !== people) {
          toast.error('Please set amounts for all people');
          return;
        }
        const totalShares = manualShares.reduce((sum, s) => sum + s.amount, 0);
        if (Math.abs(totalShares - amountNum) > 0.01) {
          toast.error(`Split amounts must add up to ₹${amountNum}`);
          return;
        }
        splitShares = manualShares;
        finalAmount = manualShares[0].amount; // Your share
      }
    }

    const expense: Omit<FoodExpense, 'id'> = {
      foodName: foodName.trim(),
      amount: finalAmount,
      date: new Date(),
      mealType,
      category,
      notes: notes.trim() || undefined,
      status: 'completed',
      transactionType,
      isSplit: transactionType === 'split',
      splitTotal: transactionType === 'split' ? amountNum : undefined,
      splitPeople: transactionType === 'split' ? parseInt(splitPeople) : undefined,
      splitMethod: transactionType === 'split' ? splitMethod : undefined,
      splitShares: transactionType === 'split' ? splitShares : undefined,
    };

    onAdd(expense);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setAmount('');
    setFoodName('');
    setNotes('');
    setMealType('lunch');
    setCategory('dine-in');
    setSplitPeople('2');
    setSplitMethod('equal');
    setManualShares([]);
  };

  const updateManualShare = (index: number, value: string) => {
    const newShares = [...manualShares];
    const amountNum = parseFloat(value) || 0;
    newShares[index] = { ...newShares[index], amount: amountNum };
    setManualShares(newShares);
  };

  // Initialize manual shares when switching to manual mode
  const handleSplitMethodChange = (method: 'equal' | 'manual') => {
    setSplitMethod(method);
    if (method === 'manual') {
      const people = parseInt(splitPeople) || 2;
      const amountNum = parseFloat(amount) || 0;
      const equalShare = Math.floor(amountNum / people * 100) / 100;
      setManualShares(
        Array.from({ length: people }, (_, i) => ({
          person: i + 1,
          amount: equalShare,
          name: i === 0 ? 'You' : `Person ${i + 1}`,
        }))
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-0 md:m-auto md:max-w-2xl md:max-h-[80vh] bg-card rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Add Transaction</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              {/* Transaction Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransactionType('expense')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      transactionType === 'expense'
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Wallet className="w-6 h-6" />
                    <span className="font-semibold">Expense</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransactionType('income')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      transactionType === 'income'
                        ? 'border-green-500 bg-green-500/10 text-green-500'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-semibold">Income</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransactionType('split')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      transactionType === 'split'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Users className="w-6 h-6" />
                    <span className="font-semibold">Split</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Amount {transactionType === 'split' && '(Total)'}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-lg font-semibold"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    ₹
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="What did you spend on?"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Split Options */}
              {transactionType === 'split' && (
                <div className="mb-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-blue-500">Split Details</h3>
                  </div>

                  {/* Number of People */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Number of People</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        min="2"
                        value={splitPeople}
                        onChange={(e) => setSplitPeople(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Split Method */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Split Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSplitMethodChange('equal')}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          splitMethod === 'equal'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        Equal Split
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSplitMethodChange('manual')}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          splitMethod === 'manual'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        Manual Split
                      </button>
                    </div>
                  </div>

                  {/* Manual Shares */}
                  {splitMethod === 'manual' && manualShares.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">Split Amounts</label>
                      {manualShares.map((share, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium min-w-[80px]">
                            {share.name || `Person ${index + 1}`}:
                          </span>
                          <div className="relative flex-1">
                            <input
                              type="number"
                              step="0.01"
                              value={share.amount}
                              onChange={(e) => updateManualShare(index, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary focus:outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              ₹
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview */}
                  {amount && splitPeople && splitMethod === 'equal' && (
                    <div className="mt-3 p-3 rounded-lg bg-background">
                      <p className="text-sm text-muted-foreground">
                        Your share: <span className="font-semibold text-foreground">
                          ₹{splitExpenseEqually(parseFloat(amount) || 0, parseInt(splitPeople) || 2)[0]?.amount.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Meal Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`p-2 rounded-lg border capitalize transition-all ${
                        mealType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodExpense['category'])}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                >
                  <option value="dine-in">Dine-in</option>
                  <option value="delivery">Delivery</option>
                  <option value="takeout">Takeout</option>
                  <option value="home-cooked">Home Cooked</option>
                  <option value="street-food">Street Food</option>
                </select>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
              >
                Add {transactionType === 'income' ? 'Income' : transactionType === 'split' ? 'Split Expense' : 'Expense'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
