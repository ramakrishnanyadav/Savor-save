import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Wallet, Calendar, TrendingDown, Trash2, 
  Filter, Download, PieChart
} from 'lucide-react';
import { useFoodExpenses } from '@/hooks/useFoodExpenses';
import { FoodExpense } from '@/types/expense';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ExpenseTrackerSimple() {
  const {
    expenses,
    budget,
    isLoading,
    addExpense,
    deleteExpense,
    getTodayTotal,
    getWeekTotal,
    getMonthTotal,
  } = useFoodExpenses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  
  // Simple add expense form state
  const [newExpense, setNewExpense] = useState({
    foodName: '',
    amount: '',
    category: 'delivery' as FoodExpense['category'],
    mealType: 'lunch' as FoodExpense['mealType'],
    notes: '',
  });

  // Filter expenses by period
  const filteredExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const now = new Date();
    
    switch (filterPeriod) {
      case 'today':
        return expDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expDate >= weekAgo;
      case 'month':
        return expDate.getMonth() === now.getMonth() && 
               expDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!newExpense.foodName.trim()) {
      toast.error('Please enter a description');
      return;
    }

    await addExpense({
      foodName: newExpense.foodName.trim(),
      amount,
      category: newExpense.category,
      mealType: newExpense.mealType,
      notes: newExpense.notes.trim() || undefined,
      date: new Date(),
      status: 'completed',
      transactionType: 'expense',
      isSplit: false,
    });

    // Reset form
    setNewExpense({
      foodName: '',
      amount: '',
      category: 'delivery',
      mealType: 'lunch',
      notes: '',
    });
    setShowAddModal(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete expense: ${name}?`)) {
      await deleteExpense(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Expense Tracker</h1>
            <p className="text-muted-foreground">Track your food expenses</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <p className="text-3xl font-bold">₹{getTodayTotal().toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <p className="text-3xl font-bold">₹{getWeekTotal().toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">This Month</span>
            </div>
            <p className="text-3xl font-bold">₹{getMonthTotal().toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">Budget</span>
            </div>
            <p className="text-3xl font-bold">₹{budget.monthly.toFixed(0)}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Filter:</span>
            <div className="flex gap-2">
              {(['all', 'today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setFilterPeriod(period)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all capitalize',
                    filterPeriod === period
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Expense List */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {filterPeriod === 'all' ? 'All Expenses' : `${filterPeriod === 'today' ? "Today's" : filterPeriod === 'week' ? "This Week's" : "This Month's"} Expenses`}
            <span className="text-muted-foreground text-base ml-2">
              ({filteredExpenses.length})
            </span>
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {filterPeriod === 'all' ? 'No expenses yet' : `No expenses for ${filterPeriod}`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{expense.foodName}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{format(expense.date, 'MMM dd, yyyy')}</span>
                        <span className="capitalize">{expense.category}</span>
                        <span className="capitalize">{expense.mealType}</span>
                      </div>
                      {expense.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{expense.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-red-500">
                        ₹{expense.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDelete(expense.id, expense.foodName)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 m-auto w-full max-w-md h-fit bg-card rounded-3xl p-6 z-50 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Add Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <input
                    type="text"
                    value={newExpense.foodName}
                    onChange={(e) => setNewExpense({ ...newExpense, foodName: e.target.value })}
                    placeholder="What did you spend on?"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as FoodExpense['category'] })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  >
                    <option value="dine-in">Dine-in</option>
                    <option value="delivery">Delivery</option>
                    <option value="takeout">Takeout</option>
                    <option value="home-cooked">Home Cooked</option>
                    <option value="street-food">Street Food</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => setNewExpense({ ...newExpense, mealType: meal })}
                        className={cn(
                          'p-2 rounded-lg border capitalize transition-all',
                          newExpense.mealType === meal
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-muted-foreground'
                        )}
                      >
                        {meal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all font-semibold"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
