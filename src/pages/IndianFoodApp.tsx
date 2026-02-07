import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Wallet, User, MapPin, Truck } from 'lucide-react';
import { IndianFoodProvider, useIndianFood } from '@/context/IndianFoodContext';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { HeroRecommendation } from '@/components/home/HeroRecommendation';
import { QuickFilters } from '@/components/home/QuickFilters';
import { TrendingSection } from '@/components/home/TrendingSection';
import { FoodDetailModal } from '@/components/home/FoodDetailModal';
import { SmartSearchBar } from '@/components/discover/SmartSearchBar';
import { BudgetRecommendations } from '@/components/discover/BudgetRecommendations';
import { CategoryBrowser } from '@/components/discover/CategoryBrowser';
import { ExpenseTrackerSimple } from '@/components/expenses/ExpenseTrackerSimple';
import { ExpenseAnalytics } from '@/components/analytics/ExpenseAnalytics';
import { NearbyFoodFinder } from '@/components/recommendations/NearbyFoodFinder';
import { LiveOrderTracking } from '@/components/tracking/LiveOrderTracking';
import { UserOrdersView } from '@/components/orders/UserOrdersView';
import { EditableProfileView } from '@/components/profile/EditableProfileView';
import { IndianMenuItem } from '@/types/indian-food';
import { getGreeting, getMealContext } from '@/data/indian-food-data';
import { cn } from '@/lib/utils';

type AppView = 'home' | 'discover' | 'expenses' | 'profile' | 'nearby' | 'tracking' | 'orders';

function AppContent() {
  const { userProfile, isOnboardingComplete, getRecommendations, getTrendingItems, menuItems } = useIndianFood();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('home');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<IndianMenuItem | null>(null);
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  const recommendations = getRecommendations(10);
  const trendingItems = getTrendingItems(8);
  const greeting = getGreeting();
  const mealContext = getMealContext();

  // Filter items based on active filter
  const filteredTrendingItems = useMemo(() => {
    if (!activeFilter) return trendingItems;
    
    return menuItems.filter(item => {
      switch (activeFilter) {
        case 'quick':
          return item.cookTime <= 30;
        case 'healthy':
          return item.calories < 400 || (item.nutrition && item.nutrition.fiber > 3);
        case 'street':
          return item.region === 'street_food';
        case 'special':
          return item.isBestseller;
        case 'budget':
          return item.price.max <= 150;
        case 'homestyle':
          return item.mealType.includes('dinner') || item.mealType.includes('lunch');
        case 'spicy':
          return item.spiceLevel === 'spicy' || item.spiceLevel === 'extra-spicy';
        default:
          return true;
      }
    }).slice(0, 12);
  }, [activeFilter, menuItems, trendingItems]);

  useEffect(() => {
    if (isOnboardingComplete) {
      setShowWelcome(false);
      setShowOnboarding(false);
    }
  }, [isOnboardingComplete]);

  const handleNextRecommendation = () => {
    setRecommendationIndex((prev) => (prev + 1) % recommendations.length);
  };

  // Welcome screen
  if (showWelcome && !isOnboardingComplete) {
    return (
      <WelcomeScreen
        onStart={() => {
          setShowWelcome(false);
          setShowOnboarding(true);
        }}
      />
    );
  }

  // Onboarding flow
  if (showOnboarding && !isOnboardingComplete) {
    return (
      <OnboardingFlow
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  const navItems = [
    { id: 'home' as AppView, label: 'Home', icon: Home },
    { id: 'discover' as AppView, label: 'Discover', icon: Search },
    { id: 'expenses' as AppView, label: 'Expenses', icon: Wallet },
    { id: 'profile' as AppView, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Back button - shown on all pages except home */}
      {activeView !== 'home' && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={() => setActiveView('home')}
          className="fixed top-20 left-4 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-110 transition-all"
          aria-label="Go back to home"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}
      
      {/* Main content */}
      <AnimatePresence mode="wait">
        {activeView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pt-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {greeting.emoji} {greeting.en}, {userProfile?.name?.split(' ')[0] || 'Friend'}!
                </h1>
                <p className="text-muted-foreground">{mealContext.en}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
                <MapPin className="w-4 h-4" />
                <span>{userProfile?.location?.city || 'Your City'}</span>
              </div>
            </div>

            {/* Hero recommendation */}
            {recommendations.length > 0 && (
              <HeroRecommendation
                item={recommendations[recommendationIndex]}
                onViewDetails={setSelectedItem}
                onNext={handleNextRecommendation}
                whyRecommended={`Popular in ${userProfile?.location?.state || 'your area'}`}
              />
            )}

            {/* Quick filters */}
            <div className="mt-6">
              <QuickFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* Trending section - filtered */}
            <TrendingSection
              title={activeFilter ? `${activeFilter === 'quick' ? 'Under 30 min' : activeFilter === 'healthy' ? 'Healthy Picks' : activeFilter === 'street' ? 'Street Food' : activeFilter === 'special' ? "Today's Special" : activeFilter === 'budget' ? 'Budget Picks' : activeFilter === 'homestyle' ? 'Home-style' : activeFilter === 'spicy' ? 'Spicy' : 'Trending Now'}` : 'Trending Now'}
              items={filteredTrendingItems}
              onViewItem={setSelectedItem}
            />
          </motion.div>
        )}

        {activeView === 'discover' && (
          <motion.div
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pt-6 pb-20"
          >
            <h1 className="text-2xl font-bold mb-4">Discover</h1>
            
            {/* Quick Access Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setActiveView('nearby')}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all text-left"
              >
                <MapPin className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Nearby Food</h3>
                <p className="text-sm opacity-90">Find within 3-10km</p>
              </button>
              
              <button
                onClick={() => setActiveView('orders')}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all text-left"
              >
                <Truck className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">My Orders</h3>
                <p className="text-sm opacity-90">View & track orders</p>
              </button>
            </div>
            
            <SmartSearchBar
              onSelectItem={setSelectedItem}
              onSelectRestaurant={() => {}}
            />

            <BudgetRecommendations onViewItem={setSelectedItem} />

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
              <CategoryBrowser onSelectItem={setSelectedItem} />
            </div>
          </motion.div>
        )}

        {activeView === 'nearby' && (
          <motion.div
            key="nearby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NearbyFoodFinder />
          </motion.div>
        )}

        {activeView === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LiveOrderTracking
              orderId="2026020600123"
              restaurantName="Biryani Paradise"
              items={[
                { name: 'Chicken Biryani', quantity: 2, price: 350 },
                { name: 'Raita', quantity: 1, price: 50 },
              ]}
              totalAmount={750}
              estimatedTime={25}
            />
          </motion.div>
        )}

        {activeView === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UserOrdersView />
          </motion.div>
        )}

        {activeView === 'expenses' && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ExpenseTrackerSimple />
            <div className="px-4 pb-20">
              <h2 className="text-2xl font-bold mb-4">📊 Analytics</h2>
              <ExpenseAnalytics />
            </div>
          </motion.div>
        )}

        {activeView === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pt-6"
          >
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <EditableProfileView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border px-4 py-2 z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Food detail modal */}
      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default function IndianFoodApp() {
  return (
    <IndianFoodProvider>
      <AppContent />
    </IndianFoodProvider>
  );
}
