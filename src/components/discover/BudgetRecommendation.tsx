import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Sparkles, ArrowRight, MapPin, Star, Clock, ChevronRight, Utensils, Heart } from 'lucide-react';
import { Restaurant, BUDGET_RANGES, MenuItem } from '@/types';
import { formatINR, cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

interface BudgetRecommendationProps {
  restaurants: Restaurant[];
  onViewRestaurant: (restaurant: Restaurant) => void;
}

export function BudgetRecommendation({ restaurants, onViewRestaurant }: BudgetRecommendationProps) {
  const { toggleFavorite, isFavorite } = useAppContext();
  const [budget, setBudget] = useState<number | null>(null);
  const [customBudget, setCustomBudget] = useState('');
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleRangeSelect = (range: typeof BUDGET_RANGES[0]) => {
    setSelectedRange(range.id);
    setBudget(range.max);
    setShowResults(true);
  };

  const handleCustomBudget = () => {
    const value = parseInt(customBudget);
    if (value && value >= 100) {
      setBudget(value);
      setSelectedRange('custom');
      setShowResults(true);
    }
  };

  const recommendations = useMemo(() => {
    if (!budget) return [];
    
    return restaurants
      .filter(r => {
        // Get minimum meal cost from menu items
        const minMealCost = Math.min(...r.menuItems.filter(m => m.category === 'main' || m.category === 'combo').map(m => m.price));
        return minMealCost <= budget && r.isOpen;
      })
      .sort((a, b) => {
        // Sort by rating and value for money
        const aValue = a.rating / (a.avgCostForTwo / 2);
        const bValue = b.rating / (b.avgCostForTwo / 2);
        return bValue - aValue;
      })
      .slice(0, 8);
  }, [budget, restaurants]);

  const getAffordableItems = (restaurant: Restaurant): MenuItem[] => {
    if (!budget) return [];
    return restaurant.menuItems
      .filter(item => item.price <= budget)
      .sort((a, b) => b.isBestseller ? 1 : -1)
      .slice(0, 3);
  };

  return (
    <div className="space-y-6">
      {/* Budget Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">What's Your Budget?</h2>
              <p className="text-white/80 text-sm">Tell us how much, we'll find the best for you</p>
            </div>
          </div>

          {/* Custom Budget Input */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-semibold text-lg">₹</span>
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder="Enter your budget"
                className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg font-medium"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCustomBudget}
              disabled={!customBudget || parseInt(customBudget) < 100}
              className="px-6 py-3.5 rounded-xl bg-white text-orange-600 font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Find
            </motion.button>
          </div>

          {/* Quick Budget Ranges */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {BUDGET_RANGES.map((range) => (
              <motion.button
                key={range.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRangeSelect(range)}
                className={cn(
                  'px-4 py-3 rounded-xl text-left transition-all border-2',
                  selectedRange === range.id
                    ? 'bg-white text-orange-600 border-white shadow-lg'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                )}
              >
                <div className="font-bold text-sm">{range.label}</div>
                <div className={cn(
                  'text-xs mt-0.5',
                  selectedRange === range.id ? 'text-orange-500' : 'text-white/70'
                )}>
                  {range.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recommendations Results */}
      <AnimatePresence>
        {showResults && budget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Perfect for {formatINR(budget)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {recommendations.length} restaurants with meals in your budget
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResults(false);
                  setBudget(null);
                  setSelectedRange(null);
                  setCustomBudget('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-2xl">
                <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No restaurants found in this budget</p>
                <p className="text-sm text-muted-foreground">Try increasing your budget a bit</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {recommendations.map((restaurant, idx) => {
                  const affordableItems = getAffordableItems(restaurant);
                  return (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onViewRestaurant(restaurant)}
                      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(restaurant.id); }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
                          >
                            <Heart className={cn(
                              "w-4 h-4 transition-colors",
                              isFavorite(restaurant.id) ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                            )} />
                          </motion.button>
                          {restaurant.trending && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              🔥 Trending
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                                {restaurant.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{restaurant.cuisine.slice(0, 2).join(', ')}</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                <span className="text-emerald-600 font-medium">
                                  {formatINR(restaurant.avgCostForTwo / 2)} per person
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-bold">{restaurant.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {restaurant.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {restaurant.deliveryTime}
                            </span>
                          </div>

                          {/* Affordable Menu Items */}
                          {affordableItems.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Within your budget:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {affordableItems.map((item) => (
                                  <span
                                    key={item.id}
                                    className={cn(
                                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border',
                                      item.isBestseller
                                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                        : 'bg-muted/50 text-muted-foreground border-transparent'
                                    )}
                                  >
                                    {item.isVeg && <span className="w-3 h-3 border-2 border-emerald-500 rounded-sm flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></span>}
                                    {!item.isVeg && <span className="w-3 h-3 border-2 border-red-500 rounded-sm flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /></span>}
                                    {item.name}
                                    <span className="text-xs opacity-70">{formatINR(item.price)}</span>
                                    {item.isBestseller && <span className="text-xs">⭐</span>}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* View More */}
                          <div className="flex items-center justify-end mt-3">
                            <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                              View Menu & Order
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
