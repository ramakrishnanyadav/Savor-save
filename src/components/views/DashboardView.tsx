import { motion } from 'framer-motion';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { RecommendedCarousel } from '@/components/restaurants/RecommendedCarousel';
import { useAppContext } from '@/context/AppContext';
import { Expense } from '@/types';

interface DashboardViewProps {
  expenses: Expense[];
  totalSpent: number;
  budgetRemaining: number;
  budgetPercentage: number;
}

export function DashboardView({
  expenses,
  totalSpent,
  budgetRemaining,
  budgetPercentage,
}: DashboardViewProps) {
  const { userProfile, restaurants, getSpendingByCuisine } = useAppContext();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getContextualSubtitle = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'Ready for breakfast? 🌅';
    if (hour >= 11 && hour < 15) return 'Lunch time! 🍽️';
    if (hour >= 15 && hour < 18) return 'Snack break? ☕';
    return 'Dinner plans? 🌙';
  };

  // Get favorite cuisine from spending data
  const spendingByCuisine = getSpendingByCuisine();
  const favoriteCuisine = Object.entries(spendingByCuisine).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Indian';

  const trendingRestaurants = restaurants.filter((r) => r.trending);
  const mealsThisWeek = expenses.filter(
    (e) => new Date(e.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Get restaurants matching favorite cuisine
  const cuisineRestaurants = restaurants.filter(r => 
    r.cuisine.some(c => c.toLowerCase().includes(favoriteCuisine.toLowerCase()))
  ).slice(0, 8);

  // Get user's first name from profile
  const firstName = userProfile.name?.split(' ')[0] || 'Foodie';

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl md:text-3xl font-bold">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          {getContextualSubtitle()}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards
        totalSpent={totalSpent}
        mealsThisWeek={mealsThisWeek}
        favoriteCuisine={favoriteCuisine}
        budgetRemaining={budgetRemaining}
        budgetPercentage={budgetPercentage}
      />

      {/* Charts & Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart />
        <RecentOrders expenses={expenses} />
      </div>

      {/* Recommended Restaurants */}
      <RecommendedCarousel
        restaurants={trendingRestaurants}
        title="Trending Near You 🔥"
        subtitle="Popular picks based on your preferences"
      />

      {/* More Recommendations based on favorite cuisine */}
      {cuisineRestaurants.length > 0 && (
        <RecommendedCarousel
          restaurants={cuisineRestaurants}
          title={`Because You Love ${favoriteCuisine}...`}
          subtitle="Similar restaurants you might enjoy"
        />
      )}
    </div>
  );
}