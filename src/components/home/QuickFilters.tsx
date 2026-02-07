import { motion } from 'framer-motion';
import { Clock, Salad, Flame, Sparkles, IndianRupee, Home, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const filters = [
  { id: 'quick', label: 'Under 30 min', icon: Clock, color: 'bg-blue-500' },
  { id: 'healthy', label: 'Healthy', icon: Salad, color: 'bg-green-500' },
  { id: 'street', label: 'Street Food', icon: Flame, color: 'bg-orange-500' },
  { id: 'special', label: "Today's Special", icon: Sparkles, color: 'bg-purple-500' },
  { id: 'budget', label: 'Budget Picks', icon: IndianRupee, color: 'bg-emerald-500' },
  { id: 'homestyle', label: 'Home-style', icon: Home, color: 'bg-amber-500' },
  { id: 'spicy', label: 'Spicy', icon: Zap, color: 'bg-red-500' },
];

export function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <motion.div 
        className="flex gap-2 pb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filters.map((filter, index) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <motion.button
              key={filter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange(isActive ? null : filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "gradient-bg text-white shadow-lg"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              <Icon className={cn("w-4 h-4", !isActive && "text-muted-foreground")} />
              <span className="text-sm font-medium">{filter.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
