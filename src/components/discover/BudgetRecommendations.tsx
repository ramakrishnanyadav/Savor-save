import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Sparkles, MapPin, Star, Clock, ChevronRight, Flame } from 'lucide-react';
import { IndianMenuItem, BUDGET_RANGES_INR } from '@/types/indian-food';
import { useIndianFood } from '@/context/IndianFoodContext';
import { getSpiceDisplay } from '@/data/indian-food-data';
import { cn } from '@/lib/utils';

interface BudgetRecommendationsProps {
  onViewItem: (item: IndianMenuItem) => void;
}

export function BudgetRecommendations({ onViewItem }: BudgetRecommendationsProps) {
  const { menuItems, restaurants } = useIndianFood();
  const [budget, setBudget] = useState<number | null>(null);
  const [customBudget, setCustomBudget] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Get recommendations based on budget
  const recommendations = useMemo(() => {
    if (!budget) return [];
    
    return menuItems
      .filter(item => item.price.max <= budget)
      .sort((a, b) => {
        // Prioritize bestsellers and items closer to budget
        const aScore = (a.isBestseller ? 10 : 0) + (budget - a.price.max);
        const bScore = (b.isBestseller ? 10 : 0) + (budget - b.price.max);
        return bScore - aScore;
      })
      .slice(0, 12);
  }, [budget, menuItems]);

  // Get restaurants with affordable items
  const affordableRestaurants = useMemo(() => {
    if (!budget) return [];
    
    return restaurants
      .filter(r => r.isOpen && r.menuItems.some(item => item.price.max <= budget))
      .map(r => ({
        ...r,
        affordableItems: r.menuItems.filter(item => item.price.max <= budget).slice(0, 3),
      }))
      .slice(0, 6);
  }, [budget, restaurants]);

  const handleBudgetSelect = (amount: number) => {
    setBudget(amount);
    setShowResults(true);
  };

  const handleCustomBudget = () => {
    const amount = parseInt(customBudget);
    if (!isNaN(amount) && amount >= 50) {
      setBudget(amount);
      setShowResults(true);
    }
  };

  return (
    <div className="py-6">
      {/* Budget input section */}
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">What's Your Budget?</h2>
              <p className="text-muted-foreground">Find the best food within your budget</p>
            </div>

            {/* Custom budget input */}
            <div className="max-w-xs mx-auto mb-6">
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                <input
                  type="number"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomBudget()}
                  placeholder="Enter amount..."
                  className="w-full pl-12 pr-24 py-4 text-2xl font-bold text-center rounded-2xl border-2 border-primary/30 focus:border-primary bg-card outline-none transition-all"
                />
                <button
                  onClick={handleCustomBudget}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold"
                >
                  Go
                </button>
              </div>
            </div>

            {/* Quick budget buttons */}
            <p className="text-sm text-muted-foreground mb-4">Or select a range:</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
              {BUDGET_RANGES_INR.map((range, index) => (
                <motion.button
                  key={range.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBudgetSelect(range.max)}
                  className="px-4 py-3 rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-all"
                >
                  <p className="font-bold text-primary">{range.label}</p>
                  <p className="text-xs text-muted-foreground">{range.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Budget: ₹{budget}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {recommendations.length} items found
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResults(false);
                  setBudget(null);
                  setCustomBudget('');
                }}
                className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm"
              >
                Change Budget
              </button>
            </div>

            {/* Recommended items grid */}
            {recommendations.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Recommended for you</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recommendations.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => onViewItem(item)}
                      className="rounded-2xl bg-card border border-border overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        <div className="absolute top-2 left-2">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                            item.isVeg ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          )}>
                            {item.isVeg ? '🟢' : '🔴'}
                          </span>
                        </div>
                        
                        {item.isBestseller && (
                          <div className="absolute top-2 right-2">
                            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                          {item.nameEn}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize mb-2">
                          {item.region.replace('_', ' ')}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-bold text-sm">
                            ₹{item.price.min}
                          </span>
                          <span className="text-xs">
                            {getSpiceDisplay(item.spiceLevel).slice(0, 2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Restaurants with affordable items */}
            {affordableRestaurants.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Restaurants with items in your budget</h3>
                <div className="space-y-4">
                  {affordableRestaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-2xl bg-card border border-border overflow-hidden"
                    >
                      <div className="flex gap-4 p-4">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{restaurant.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {restaurant.distance} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {restaurant.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {restaurant.deliveryTime}
                            </span>
                          </div>
                          
                          {/* Affordable items preview */}
                          <div className="flex gap-2 mt-3">
                            {restaurant.affordableItems.map((item) => (
                              <span
                                key={item.id}
                                className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs"
                              >
                                {item.nameEn} • ₹{item.price.min}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">😅</p>
                <p className="text-lg font-medium">No items in this budget range</p>
                <p className="text-muted-foreground">Try increasing your budget a bit</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
