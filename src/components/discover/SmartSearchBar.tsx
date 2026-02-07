import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, MicOff, X, MapPin, Clock, IndianRupee, Utensils, TrendingUp, Loader2 } from 'lucide-react';
import { IndianMenuItem, IndianRestaurant, BUDGET_RANGES_INR, REGIONAL_CUISINES } from '@/types/indian-food';
import { useIndianFood } from '@/context/IndianFoodContext';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

interface SmartSearchBarProps {
  onSelectItem: (item: IndianMenuItem) => void;
  onSelectRestaurant: (restaurant: IndianRestaurant) => void;
}

export function SmartSearchBar({ onSelectItem, onSelectRestaurant }: SmartSearchBarProps) {
  const { menuItems, restaurants } = useIndianFood();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { isListening, isProcessing, startListening, stopListening } = useVoiceSearch((text) => {
    setQuery(text);
    setIsFocused(true);
  });
  // Optimistic search - instant filtering with debounce feel
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    
    if (!q) {
      // Show popular items when empty
      return { 
        items: menuItems.filter(item => item.isBestseller).slice(0, 6), 
        restaurants: restaurants.filter(r => r.trending).slice(0, 4), 
        budgets: [], 
        cuisines: REGIONAL_CUISINES.slice(0, 4), 
        locations: [] 
      };
    }
    
    // Multi-field search with relevance scoring
    const matchingItems = menuItems
      .map(item => {
        let score = 0;
        const nameMatch = item.nameEn.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const regionMatch = item.region.replace('_', ' ').toLowerCase().includes(q);
        const ingredientMatch = item.ingredients.some(ing => ing.en.toLowerCase().includes(q));
        
        if (nameMatch) score += 10;
        if (item.nameEn.toLowerCase().startsWith(q)) score += 5;
        if (descMatch) score += 3;
        if (regionMatch) score += 4;
        if (ingredientMatch) score += 2;
        if (item.isBestseller) score += 1;
        
        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => item);

    // Restaurants matching
    const matchingRestaurants = restaurants.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.specialities.some(s => s.toLowerCase().includes(q))
    ).slice(0, 4);

    // Budget matching
    const budgetNum = parseInt(query);
    const matchingBudgets = !isNaN(budgetNum) 
      ? BUDGET_RANGES_INR.filter(b => budgetNum >= b.min && budgetNum <= b.max).slice(0, 2)
      : [];

    // Cuisine matching
    const matchingCuisines = REGIONAL_CUISINES.filter(c =>
      c.nameEn.toLowerCase().includes(q)
    ).slice(0, 4);

    // Location matching
    const matchingLocations = [...new Set(restaurants.map(r => r.location))]
      .filter(loc => loc.toLowerCase().includes(q))
      .slice(0, 3);

    return {
      items: matchingItems,
      restaurants: matchingRestaurants,
      budgets: matchingBudgets,
      cuisines: matchingCuisines,
      locations: matchingLocations,
    };
  }, [query, menuItems, restaurants]);

  const hasResults = suggestions.items.length > 0 || 
    suggestions.restaurants.length > 0 || 
    suggestions.budgets.length > 0 ||
    suggestions.cuisines.length > 0 ||
    suggestions.locations.length > 0;

  const trendingSearches = ['Butter Chicken', 'Dosa', 'Biryani', 'Street Food', 'Healthy'];
  const popularCategories = ['North Indian', 'South Indian', 'Chinese', 'Desserts'];

  return (
    <div className="relative">
      {/* Search input */}
      <div className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-card transition-all",
        isFocused ? "border-primary shadow-lg" : "border-border"
      )}>
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Craving something? Search..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
        <button 
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={cn(
            "p-2 rounded-xl transition-all",
            isListening 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-primary/10 text-primary hover:bg-primary/20",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
          >
            {!query && (
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Trending searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(search)}
                      className="px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      {search}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 mb-2 flex items-center gap-2">
                  <Utensils className="w-3 h-3" />
                  Popular categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularCategories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(cat)}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasResults && (
              <div className="divide-y divide-border">
                {/* Food items */}
                {suggestions.items.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <Utensils className="w-3 h-3" />
                      Food Items
                    </p>
                    {suggestions.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectItem(item);
                          setQuery('');
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-all text-left"
                      >
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.nameEn}</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{item.price.min} - {item.price.max} • {item.region.replace('_', ' ')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Restaurants */}
                {suggestions.restaurants.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      Restaurants
                    </p>
                    {suggestions.restaurants.map((restaurant) => (
                      <button
                        key={restaurant.id}
                        onClick={() => {
                          onSelectRestaurant(restaurant);
                          setQuery('');
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-all text-left"
                      >
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{restaurant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {restaurant.location} • ⭐ {restaurant.rating}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Budget ranges */}
                {suggestions.budgets.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <IndianRupee className="w-3 h-3" />
                      Budget Range
                    </p>
                    {suggestions.budgets.map((budget) => (
                      <button
                        key={budget.id}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-all text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <IndianRupee className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{budget.label}</p>
                          <p className="text-xs text-muted-foreground">{budget.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Cuisines */}
                {suggestions.cuisines.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Cuisines
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.cuisines.map((cuisine) => (
                        <button
                          key={cuisine.id}
                          className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-2"
                        >
                          <span>{cuisine.icon}</span>
                          <span className="text-sm font-medium">{cuisine.nameEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {query && !hasResults && (
              <div className="p-8 text-center">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-muted-foreground">No results for "{query}"</p>
                <p className="text-sm text-muted-foreground">Try searching for a dish, restaurant, or budget</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
