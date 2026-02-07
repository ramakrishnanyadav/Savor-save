import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { useFoodExpenses } from '@/hooks/useFoodExpenses';
import { format, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

export function ExpenseAnalytics() {
  const {
    expenses,
    getSpendingByCategory,
    getSpendingByCuisine,
    getSpendingByMealType,
  } = useFoodExpenses();

  // Category data for pie chart
  const categoryData = useMemo(() => {
    const spending = getSpendingByCategory();
    return Object.entries(spending).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Number(value.toFixed(2)),
    }));
  }, [getSpendingByCategory]);

  // Meal type data for bar chart
  const mealTypeData = useMemo(() => {
    const spending = getSpendingByMealType();
    return Object.entries(spending).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount: Number(value.toFixed(2)),
    }));
  }, [getSpendingByMealType]);

  // Daily spending trend for line chart
  const dailyTrendData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.toDateString() === day.toDateString();
      });
      
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      return {
        date: format(day, 'MMM dd'),
        amount: Number(total.toFixed(2)),
      };
    });
  }, [expenses]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedExpenses = expenses.filter(e => e.status === 'completed');
    const total = completedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avg = total / (completedExpenses.length || 1);
    const max = Math.max(...completedExpenses.map(e => e.amount), 0);
    const min = Math.min(...completedExpenses.map(e => e.amount), 0);

    // Calculate trend (comparing this month vs last month)
    const now = new Date();
    const thisMonth = completedExpenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === now.getMonth();
    });
    const lastMonth = completedExpenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === now.getMonth() - 1;
    });

    const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0);
    const trend = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    return {
      total,
      avg,
      max,
      min,
      trend,
      count: completedExpenses.length,
    };
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium">Total Spent</span>
          </div>
          <p className="text-3xl font-bold">₹{stats.total.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">{stats.count} transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium">Average</span>
          </div>
          <p className="text-3xl font-bold">₹{stats.avg.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">per transaction</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium">Highest</span>
          </div>
          <p className="text-3xl font-bold">₹{stats.max.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">single expense</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl text-white shadow-lg ${
            stats.trend >= 0 
              ? 'bg-gradient-to-br from-red-500 to-red-600' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            {stats.trend >= 0 ? (
              <TrendingUp className="w-8 h-8 opacity-80" />
            ) : (
              <TrendingDown className="w-8 h-8 opacity-80" />
            )}
            <span className="text-sm font-medium">Trend</span>
          </div>
          <p className="text-3xl font-bold">{Math.abs(stats.trend).toFixed(1)}%</p>
          <p className="text-sm opacity-80 mt-1">
            {stats.trend >= 0 ? 'increase' : 'decrease'}
          </p>
        </motion.div>
      </div>

      {/* Charts Row 1: Category Pie + Meal Type Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl bg-card border border-border shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Spending by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </motion.div>

        {/* Meal Type Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-3xl bg-card border border-border shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4">Spending by Meal Type</h3>
          {mealTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mealTypeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Daily Trend Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-3xl bg-card border border-border shadow-lg"
      >
        <h3 className="text-xl font-bold mb-4">Daily Spending Trend (This Month)</h3>
        {dailyTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </motion.div>
    </div>
  );
}
