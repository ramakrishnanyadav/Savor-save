import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { RefreshCw, MoreHorizontal, MapPin } from 'lucide-react';
import { Expense } from '@/types';
import { cn } from '@/lib/utils';

interface RecentOrdersProps {
  expenses: Expense[];
}

const getCategoryEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    'Dine-in': '🍽️',
    'Delivery': '🛵',
    'Takeout': '🥡',
    'Coffee & Drinks': '☕',
    'Groceries': '🛒',
    'Desserts': '🍰',
    'Bars & Pubs': '🍻',
    'Special Events': '🎉',
  };
  return emojis[category] || '🍽️';
};

export function RecentOrders({ expenses }: RecentOrdersProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-primary font-medium"
        >
          View All
        </motion.button>
      </div>

      <div className="space-y-3">
        {expenses.slice(0, 5).map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            {/* Emoji Icon */}
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {getCategoryEmoji(expense.category)}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{expense.restaurant}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {expense.cuisine}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{format(new Date(expense.date), 'MMM d, h:mm a')}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span>{expense.category}</span>
              </div>
            </div>

            {/* Amount & Actions */}
            <div className="flex items-center gap-3">
              <span className="font-semibold">${expense.amount.toFixed(2)}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
