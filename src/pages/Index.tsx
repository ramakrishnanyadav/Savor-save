import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, TrendingUp, Wallet, ChevronRight, Star, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { DashboardView } from '@/components/views/DashboardView';
import { DiscoverView } from '@/components/views/DiscoverView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { BudgetView } from '@/components/views/BudgetView';
import { OrdersView } from '@/components/views/OrdersView';
import { ProfileView } from '@/components/views/ProfileView';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { expenses, addExpense, deleteExpense, getTotalSpent, monthlyBudget, budgetRemaining, budgetPercentage, setMonthlyBudget } = useAppContext();
  const totalSpent = getTotalSpent();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  if (showLanding) {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/10 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-glow mx-auto mb-4">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-2">
              <span className="gradient-text">Culinary Compass</span>
            </h1>
            <p className="text-xl text-muted-foreground">Track • Discover • Save</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {[
              { value: 10000, suffix: '+', label: 'Restaurants' },
              { value: 2, prefix: '₹', suffix: 'Cr+', label: 'Tracked' },
              { value: 50, suffix: '+', label: 'Cuisines' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="text-3xl md:text-4xl font-bold gradient-text"
                />
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mb-12"
          >
            {[
              { icon: Star, title: 'Smart Recommendations', desc: 'AI-powered food suggestions' },
              { icon: Wallet, title: 'Expense Tracking', desc: 'Never lose track of spending' },
              { icon: TrendingUp, title: 'Budget Insights', desc: 'Visualize your food habits' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLanding(false)}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white text-lg font-semibold shadow-glow"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Culinary Journey
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 min-w-0">
          <TopBar
            onAddExpense={() => setShowAddExpense(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onViewChange={setActiveView}
          />

          <main className="px-4 md:px-8 py-6">
            <AnimatePresence mode="wait">
              {activeView === 'dashboard' && (
                <DashboardView
                  key="dashboard"
                  expenses={expenses}
                  totalSpent={totalSpent}
                  budgetRemaining={budgetRemaining}
                  budgetPercentage={budgetPercentage}
                />
              )}
              {activeView === 'discover' && <DiscoverView key="discover" />}
              {activeView === 'orders' && (
                <OrdersView key="orders" expenses={expenses} onDelete={deleteExpense} />
              )}
              {activeView === 'analytics' && (
                <AnalyticsView key="analytics" expenses={expenses} totalSpent={totalSpent} />
              )}
              {activeView === 'budget' && (
                <BudgetView
                  key="budget"
                  budget={monthlyBudget}
                  spent={totalSpent}
                  remaining={budgetRemaining}
                  percentage={budgetPercentage}
                  onUpdateBudget={setMonthlyBudget}
                />
              )}
              {activeView === 'profile' && (
                <ProfileView
                  key="profile"
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <MobileNav activeView={activeView} onViewChange={setActiveView} />

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onAdd={addExpense}
      />
    </div>
  );
}

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
