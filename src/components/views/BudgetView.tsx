import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertCircle, CheckCircle, IndianRupee } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { cn, formatIndianNumber } from '@/lib/utils';

interface BudgetViewProps {
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  onUpdateBudget: (amount: number) => void;
}

export function BudgetView({ budget, spent, remaining, percentage, onUpdateBudget }: BudgetViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());

  const status = percentage >= 90 ? 'danger' : percentage >= 70 ? 'warning' : 'healthy';

  const handleSaveBudget = () => {
    const amount = parseFloat(newBudget);
    if (!isNaN(amount) && amount > 0) {
      onUpdateBudget(amount);
    }
    setIsEditing(false);
  };

  const categoryBudgets = [
    { name: 'Dine-in', budget: 5000, spent: 3625, color: 'bg-amber-500' },
    { name: 'Delivery', budget: 4000, spent: 2880, color: 'bg-orange-500' },
    { name: 'Takeout', budget: 2500, spent: 1300, color: 'bg-emerald-500' },
    { name: 'Coffee & Drinks', budget: 2000, spent: 1100, color: 'bg-violet-500' },
    { name: 'Groceries', budget: 1500, spent: 600, color: 'bg-blue-500' },
  ];

  const tips = [
    { emoji: '💡', text: 'You spend 40% more on weekends. Try meal prepping on Sundays!' },
    { emoji: '🎯', text: `At this rate, you'll save ₹${formatIndianNumber(Math.max(0, remaining))} by month end. Keep it up!` },
    { emoji: '🍕', text: 'Italian restaurants are your biggest expense. Look for deals!' },
  ];

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Budget</h1>
        <p className="text-muted-foreground">
          Track and manage your food spending
        </p>
      </motion.div>

      {/* Main Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Budget Circle */}
          <div className="relative w-48 h-48 mx-auto md:mx-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke={
                  status === 'danger'
                    ? 'hsl(0, 84%, 60%)'
                    : status === 'warning'
                    ? 'hsl(45, 93%, 47%)'
                    : 'hsl(160, 84%, 39%)'
                }
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - Math.min(percentage, 100) / 100) }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm text-muted-foreground">Spent</span>
              <AnimatedCounter
                value={spent}
                prefix="₹"
                decimals={0}
                className="text-3xl font-bold"
              />
              <span className="text-sm text-muted-foreground">
                of ₹{formatIndianNumber(budget)}
              </span>
            </div>
          </div>

          {/* Budget Stats */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Monthly Budget</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveBudget}
                      className="p-1 rounded bg-primary text-white"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">₹{formatIndianNumber(budget)}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary font-medium"
                    >
                      Edit
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Remaining</span>
                </div>
                <span
                  className={cn(
                    'text-xl font-bold',
                    remaining < 0 ? 'text-destructive' : 'text-emerald-500'
                  )}
                >
                  ₹{formatIndianNumber(Math.abs(remaining))}
                  {remaining < 0 && ' over'}
                </span>
              </div>
            </div>

            {/* Status Alert */}
            <div
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl',
                status === 'danger' && 'bg-destructive/10',
                status === 'warning' && 'bg-amber-500/10',
                status === 'healthy' && 'bg-emerald-500/10'
              )}
            >
              {status === 'danger' ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : status === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
              <p className="text-sm">
                {status === 'danger' && "You've exceeded 90% of your budget!"}
                {status === 'warning' && "You're approaching your budget limit."}
                {status === 'healthy' && "Great job! You're on track this month."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Budgets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {categoryBudgets.map((cat, index) => {
            const catPercentage = (cat.spent / cat.budget) * 100;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ₹{formatIndianNumber(cat.spent)} / ₹{formatIndianNumber(cat.budget)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(catPercentage, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    className={cn('h-full rounded-full', cat.color)}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Smart Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Smart Insights</h3>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
            >
              <span className="text-2xl">{tip.emoji}</span>
              <p className="text-sm">{tip.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
