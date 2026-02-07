import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, TrendingUp, TrendingDown, Wallet, Calendar, PieChart, 
  List, ChevronRight, Trash2, AlertCircle, CheckCircle, 
  XCircle, Clock, Ban, Users, DollarSign
} from 'lucide-react';
import { useFoodExpenses } from '@/hooks/useFoodExpenses';
import { AddExpenseModalNew } from './AddExpenseModalNew';
import { FoodExpense } from '@/types/expense';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ExpenseTrackerEnhanced() {
  const {
    expenses,
    budget,
    budgetUsage,
    isLoading,
    addExpense,
    deleteExpense,
    cancelExpense,
    updateExpenseStatus,
    getTodayTotal,
    getWeekTotal,
    getMonthTotal,
    splitExpenseEqually,
    canAddExpense,
  } = useFoodExpenses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [selectedStatus, setSelectedStatus] = useState<'all' | FoodExpense['status']>('all');
  const [selectedType, setSelectedType] = useState<'all' | FoodExpense['transactionType']>('all');

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    if (selectedStatus !== 'all' && exp.status !== selectedStatus) return false;
    if (selectedType !== 'all' && exp.transactionType !== selectedType) return false;
    return true;
  });

  // Calculate totals by transaction type
  const completedExpenses = expenses.filter(e => e.status === 'completed');
  const totalExpenses = completedExpenses
    .filter(e => e.transactionType === 'expense' || e.transactionType === 'split')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = completedExpenses
    .filter(e => e.transactionType === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Status counts
  const statusCounts = {
    pending: expenses.filter(e => e.status === 'pending').length,
    completed: expenses.filter(e => e.status === 'completed').length,
    failed: expenses.filter(e => e.status === 'failed').length,
    cancelled: expenses.filter(e => e.status === 'cancelled').length,
  };

  const getStatusIcon = (status: FoodExpense['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <Ban className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionTypeColor = (type: FoodExpense['transactionType']) => {
    switch (type) {
      case 'income': return 'text-green-500 bg-green-500/10';
      case 'expense': return 'text-red-500 bg-red-500/10';
      case 'split': return 'text-blue-500 bg-blue-500/10';
    }
  };

  const handleCancelExpense = (id: string, foodName: string) => {
    const confirmed = window.confirm(`Cancel expense: ${foodName}?`);
    if (confirmed) {
      const reason = window.prompt('Reason for cancellation (optional):');
      cancelExpense(id, reason || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Expense Tracker</h1>
            <p className="text-muted-foreground">Track your income, expenses & splits</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>

        {/* Budget Progress Card */}
        {budgetUsage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Budget Status</h3>
                <p className="text-sm text-muted-foreground capitalize">{budget.budgetPeriod} Budget</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ₹{budgetUsage.remaining.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetUsage.percentageUsed, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  'h-full transition-colors',
                  budgetUsage.percentageUsed >= 100 ? 'bg-red-500' :
                  budgetUsage.percentageUsed >= budgetUsage.alertThreshold ? 'bg-yellow-500' :
                  'bg-green-500'
                )}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ₹{budgetUsage.totalSpent.toFixed(2)} spent
              </span>
              <span className={cn(
                'font-semibold',
                budgetUsage.percentageUsed >= 100 ? 'text-red-500' :
                budgetUsage.percentageUsed >= budgetUsage.alertThreshold ? 'text-yellow-500' :
                'text-green-500'
              )}>
                {budgetUsage.percentageUsed.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                ₹{budgetUsage.budgetLimit.toFixed(2)} budget
              </span>
            </div>

            {/* Alert Message */}
            {budgetUsage.percentageUsed >= budgetUsage.alertThreshold && (
              <div className={cn(
                'mt-4 p-3 rounded-xl flex items-center gap-2',
                budgetUsage.percentageUsed >= 100 
                  ? 'bg-red-500/10 text-red-500' 
                  : 'bg-yellow-500/10 text-yellow-500'
              )}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">
                  {budgetUsage.percentageUsed >= 100
                    ? `You've exceeded your budget by ₹${(budgetUsage.totalSpent - budgetUsage.budgetLimit).toFixed(2)}`
                    : `You've used ${budgetUsage.percentageUsed.toFixed(0)}% of your budget`}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Today's Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <p className="text-3xl font-bold">₹{getTodayTotal().toFixed(2)}</p>
          </motion.div>

          {/* Week's Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <p className="text-3xl font-bold">₹{getWeekTotal().toFixed(2)}</p>
          </motion.div>

          {/* Month's Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">This Month</span>
            </div>
            <p className="text-3xl font-bold">₹{getMonthTotal().toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Income/Expense Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">Income</span>
            </div>
            <p className="text-2xl font-bold">₹{totalIncome.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Expenses</span>
            </div>
            <p className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>
          </div>

          <div className={cn(
            'p-4 rounded-xl border',
            netBalance >= 0 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          )}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={cn('w-5 h-5', netBalance >= 0 ? 'text-green-500' : 'text-red-500')} />
              <span className={cn('text-sm font-medium', netBalance >= 0 ? 'text-green-500' : 'text-red-500')}>
                Net Balance
              </span>
            </div>
            <p className="text-2xl font-bold">{netBalance >= 0 ? '+' : ''}₹{netBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 rounded-2xl bg-card border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    selectedStatus === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  All ({expenses.length})
                </button>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as FoodExpense['status'])}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
                      selectedStatus === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {getStatusIcon(status as FoodExpense['status'])}
                    <span className="capitalize">{status} ({count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    selectedType === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  All
                </button>
                {(['income', 'expense', 'split'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                      selectedType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Transactions</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
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
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(expense.status)}
                          <h3 className="font-semibold">{expense.foodName}</h3>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getTransactionTypeColor(expense.transactionType))}>
                            {expense.transactionType}
                          </span>
                          {expense.isSplit && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                              <Users className="w-3 h-3" />
                              Split
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{format(expense.date, 'MMM dd, yyyy • hh:mm a')}</span>
                          <span className="capitalize">{expense.category}</span>
                          <span className="capitalize">{expense.mealType}</span>
                        </div>
                        {expense.isSplit && expense.splitTotal && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Your share: ₹{expense.amount.toFixed(2)} of ₹{expense.splitTotal.toFixed(2)} ({expense.splitPeople} people)
                          </p>
                        )}
                        {expense.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{expense.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={cn(
                            'text-xl font-bold',
                            expense.transactionType === 'income' ? 'text-green-500' : 'text-red-500'
                          )}>
                            {expense.transactionType === 'income' ? '+' : '-'}₹{expense.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {expense.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateExpenseStatus(expense.id, 'completed')}
                                className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors"
                                title="Mark as completed"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateExpenseStatus(expense.id, 'failed')}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                title="Mark as failed"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {(expense.status === 'pending' || expense.status === 'completed') && (
                            <button
                              onClick={() => handleCancelExpense(expense.id, expense.foodName)}
                              className="p-1.5 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-500 transition-colors"
                              title="Cancel"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModalNew
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addExpense}
        canAddExpense={canAddExpense}
        splitExpenseEqually={splitExpenseEqually}
      />
    </div>
  );
}
