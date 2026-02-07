import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar, PieChart, List, ChevronRight, Trash2 } from 'lucide-react';
import { useFoodExpenses } from '@/hooks/useFoodExpenses';
import { AddExpenseModal } from './AddExpenseModal';
import { cn } from '@/lib/utils';

export function ExpenseTracker() {
  const {
    expenses,
    budget,
    addExpense,
    deleteExpense,
    getTodayTotal,
    getWeekTotal,
    getMonthTotal,
    getRecentExpenses,
    getSpendingByCategory,
    budgetStatus,
  } = useFoodExpenses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analytics'>('overview');

  const recentExpenses = getRecentExpenses(5);
  const categorySpending = getSpendingByCategory();

  const stats = [
    {
      label: 'Today',
      amount: getTodayTotal(),
      budget: budget.daily,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'This Week',
      amount: getWeekTotal(),
      budget: budget.weekly,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'This Month',
      amount: getMonthTotal(),
      budget: budget.monthly,
      icon: Wallet,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'dine-in': '🍽️',
      'delivery': '🛵',
      'takeout': '🥡',
      'home-cooked': '🏠',
      'street-food': '🍲',
    };
    return icons[category] || '🍽️';
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <p className="text-muted-foreground">Track your food spending</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="p-3 rounded-full gradient-bg text-white shadow-glow"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Budget Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-br from-primary to-orange-600 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Monthly Budget</p>
            <p className="text-3xl font-bold">₹{budget.monthly.toLocaleString('en-IN')}</p>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            budgetStatus.monthly.status === 'danger' ? 'bg-red-500/30' :
            budgetStatus.monthly.status === 'warning' ? 'bg-yellow-500/30' : 'bg-green-500/30'
          )}>
            {budgetStatus.monthly.percentUsed.toFixed(0)}% used
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-white/20 overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetStatus.monthly.percentUsed, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn(
              "h-full rounded-full",
              budgetStatus.monthly.status === 'danger' ? 'bg-red-400' :
              budgetStatus.monthly.status === 'warning' ? 'bg-yellow-400' : 'bg-green-400'
            )}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span>Spent: ₹{budgetStatus.monthly.spent.toLocaleString('en-IN')}</span>
          <span>Remaining: ₹{Math.max(0, budgetStatus.monthly.remaining).toLocaleString('en-IN')}</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const percentUsed = (stat.amount / stat.budget) * 100;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", stat.bgColor)}>
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold">₹{stat.amount.toLocaleString('en-IN')}</p>
              <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", stat.bgColor.replace('/10', ''))}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted">
        {[
          { id: 'overview' as const, label: 'Overview', icon: PieChart },
          { id: 'history' as const, label: 'History', icon: List },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                activeTab === tab.id
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Category Breakdown */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <h3 className="font-semibold mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {Object.entries(categorySpending).length > 0 ? (
                  Object.entries(categorySpending)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => {
                      const total = Object.values(categorySpending).reduce((a, b) => a + b, 0);
                      const percent = (amount / total) * 100;
                      
                      return (
                        <div key={category} className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(category)}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{category.replace('-', ' ')}</span>
                              <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className="h-full rounded-full gradient-bg"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-center text-muted-foreground py-4">No expenses yet</p>
                )}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Expenses</h3>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="text-sm text-primary font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all"
                    >
                      <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{expense.foodName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                          {expense.restaurant && ` • ${expense.restaurant}`}
                        </p>
                      </div>
                      <span className="font-semibold">₹{expense.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No expenses yet. Tap + to add your first expense!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{expense.foodName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                      {expense.restaurant && ` • ${expense.restaurant}`}
                    </p>
                    {expense.cuisine && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                        {expense.cuisine}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">₹{expense.amount.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">📝</p>
                <p className="text-lg font-medium">No expenses recorded</p>
                <p className="text-muted-foreground">Start tracking your food spending</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addExpense}
      />
    </div>
  );
}
