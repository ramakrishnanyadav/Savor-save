import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { weeklySpendingData, categorySpendingData, cuisineSpendingData } from '@/data/mockData';
import { Expense } from '@/types';
import { TrendingUp, IndianRupee, Utensils, Target } from 'lucide-react';
import { formatIndianNumber } from '@/lib/utils';

interface AnalyticsViewProps {
  expenses: Expense[];
  totalSpent: number;
}

export function AnalyticsView({ expenses, totalSpent }: AnalyticsViewProps) {
  const avgPerMeal = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const mostExpensive = expenses.reduce(
    (max, e) => (e.amount > max.amount ? e : max),
    expenses[0] || { amount: 0, restaurant: 'N/A' }
  );

  const stats = [
    {
      label: 'Total Spent',
      value: totalSpent,
      prefix: '₹',
      decimals: 0,
      icon: IndianRupee,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Avg Per Meal',
      value: avgPerMeal,
      prefix: '₹',
      decimals: 0,
      icon: Utensils,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Most Expensive',
      value: mostExpensive?.amount || 0,
      prefix: '₹',
      decimals: 0,
      subtitle: mostExpensive?.restaurant,
      icon: TrendingUp,
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      label: 'Total Orders',
      value: expenses.length,
      decimals: 0,
      icon: Target,
      gradient: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into your food spending
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${stat.gradient}`}
            >
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              decimals={stat.decimals}
              className="text-xl font-bold"
            />
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySpendingData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${formatIndianNumber(value)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [`₹${formatIndianNumber(value)}`, 'Spent']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(24, 95%, 53%)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">By Category</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpendingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categorySpendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [`₹${formatIndianNumber(value)}`, 'Spent']}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cuisine Spending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4">Spending by Cuisine</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cuisineSpendingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${formatIndianNumber(value)}`}
                />
                <YAxis
                  type="category"
                  dataKey="cuisine"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'amount' ? `₹${formatIndianNumber(value)}` : `${value} orders`,
                    name === 'amount' ? 'Spent' : 'Orders',
                  ]}
                />
                <Bar dataKey="amount" fill="hsl(24, 95%, 53%)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
