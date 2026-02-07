import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Utensils, Wallet, Heart, Target } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  totalSpent: number;
  mealsThisWeek: number;
  favoriteCuisine: string;
  budgetRemaining: number;
  budgetPercentage: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  }),
};

export function StatsCards({
  totalSpent,
  mealsThisWeek,
  favoriteCuisine,
  budgetRemaining,
  budgetPercentage,
}: StatsCardsProps) {
  const stats = [
    {
      id: 'spent',
      label: "This Month's Spending",
      value: totalSpent,
      prefix: '₹',
      decimals: 0,
      trend: '+12%',
      trendUp: true,
      icon: Wallet,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'meals',
      label: 'Meals This Week',
      value: mealsThisWeek,
      suffix: ' meals',
      decimals: 0,
      trend: '+3',
      trendUp: true,
      icon: Utensils,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'cuisine',
      label: 'Favorite Cuisine',
      textValue: favoriteCuisine,
      icon: Heart,
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      id: 'budget',
      label: 'Budget Remaining',
      value: budgetRemaining,
      prefix: '₹',
      decimals: 0,
      progress: budgetPercentage,
      icon: Target,
      gradient: budgetPercentage > 80 ? 'from-red-500 to-rose-600' : 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="stat-card group"
        >
          {/* Background Gradient Orb */}
          <div
            className={cn(
              'absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300',
              `bg-gradient-to-br ${stat.gradient}`,
              'group-hover:opacity-30'
            )}
          />

          {/* Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
              `bg-gradient-to-br ${stat.gradient}`
            )}
          >
            <stat.icon className="w-6 h-6 text-white" />
          </div>

          {/* Label */}
          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>

          {/* Value */}
          {stat.textValue ? (
            <p className="text-2xl font-bold">{stat.textValue}</p>
          ) : (
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                value={stat.value || 0}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
                className="text-2xl font-bold"
              />
              {stat.trend && (
                <span
                  className={cn(
                    'flex items-center text-xs font-medium',
                    stat.trendUp ? 'text-emerald' : 'text-destructive'
                  )}
                >
                  {stat.trendUp ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {stat.trend}
                </span>
              )}
            </div>
          )}

          {/* Progress Bar for Budget */}
          {stat.progress !== undefined && (
            <div className="mt-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    stat.progress > 80
                      ? 'bg-destructive'
                      : stat.progress > 60
                      ? 'bg-amber-500'
                      : 'bg-emerald'
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.progress.toFixed(0)}% of budget used
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
