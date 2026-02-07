import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Utensils, IndianRupee, Clock, Star, TrendingUp, History } from 'lucide-react';
import { Restaurant, BUDGET_RANGES } from '@/types';
import { formatINR, cn } from '@/lib/utils';

interface SmartSearchProps {
  restaurants: Restaurant[];
  onSearch: (query: string, filters: SearchFilters) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export interface SearchFilters {
  query: string;
  location: string | null;
  cuisine: string | null;
  budgetRange: typeof BUDGET_RANGES[0] | null;
}

export function SmartSearch({ restaurants, onSearch, onSelectRestaurant }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches] = useState(['Biryani', 'Pizza near me', 'Under ₹300']);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract unique values for suggestions
  const allCuisines = useMemo(() => 
    [...new Set(restaurants.flatMap(r => r.cuisine))].sort(),
    [restaurants]
  );
  
  const allLocations = useMemo(() => 
    [...new Set(restaurants.map(r => r.location))].sort(),
    [restaurants]
  );

  const allFoodItems = useMemo(() => {
    const items = new Set<string>();
    restaurants.forEach(r => {
      r.menuItems.forEach(m => items.add(m.name));
    });
    return [...items].slice(0, 20);
  }, [restaurants]);

  // Smart suggestions based on query
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const results: Array<{ type: 'restaurant' | 'food' | 'cuisine' | 'location' | 'budget'; value: string; extra?: string; item?: Restaurant }> = [];

    // Match restaurants
    restaurants
      .filter(r => r.name.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(r => results.push({ 
        type: 'restaurant', 
        value: r.name, 
        extra: `${r.cuisine[0]} • ${r.location}`,
        item: r 
      }));

    // Match food items
    allFoodItems
      .filter(f => f.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(f => results.push({ type: 'food', value: f }));

    // Match cuisines
    allCuisines
      .filter(c => c.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .forEach(c => results.push({ type: 'cuisine', value: c }));

    // Match locations
    allLocations
      .filter(l => l.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .forEach(l => results.push({ type: 'location', value: l }));

    // Match budget keywords
    if (lowerQuery.includes('under') || lowerQuery.includes('budget') || lowerQuery.includes('cheap')) {
      BUDGET_RANGES.slice(0, 3).forEach(b => 
        results.push({ type: 'budget', value: b.label, extra: b.description })
      );
    }

    return results.slice(0, 8);
  }, [query, restaurants, allCuisines, allLocations, allFoodItems]);

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    if (suggestion.type === 'restaurant' && suggestion.item) {
      onSelectRestaurant(suggestion.item);
      setQuery('');
      setIsFocused(false);
    } else {
      setQuery(suggestion.value);
      onSearch(suggestion.value, {
        query: suggestion.value,
        location: suggestion.type === 'location' ? suggestion.value : null,
        cuisine: suggestion.type === 'cuisine' ? suggestion.value : null,
        budgetRange: null,
      });
      setIsFocused(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return <Utensils className="w-4 h-4 text-primary" />;
      case 'food': return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'cuisine': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'location': return <MapPin className="w-4 h-4 text-emerald-500" />;
      case 'budget': return <IndianRupee className="w-4 h-4 text-blue-500" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className={cn(
        'relative flex items-center transition-all duration-200',
        isFocused ? 'ring-2 ring-primary/50' : ''
      )}>
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search food, restaurant, cuisine, or location..."
          className="w-full pl-12 pr-10 py-4 rounded-2xl bg-muted/50 border border-border focus:outline-none text-base"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3 border-b border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Recent Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setQuery(search)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      <History className="w-3 h-3 text-muted-foreground" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={`${suggestion.type}-${suggestion.value}-${idx}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      {getIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.value}</div>
                      {suggestion.extra && (
                        <div className="text-sm text-muted-foreground truncate">{suggestion.extra}</div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded-full bg-muted">
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Filters */}
            <div className="p-3 border-t border-border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick Filters</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSearch('', { query: '', location: null, cuisine: null, budgetRange: BUDGET_RANGES[0] })}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  💰 Under ₹300
                </button>
                <button
                  onClick={() => setQuery('Near me')}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                >
                  📍 Near Me
                </button>
                <button
                  onClick={() => onSearch('trending', { query: 'trending', location: null, cuisine: null, budgetRange: null })}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => onSearch('top rated', { query: 'top rated', location: null, cuisine: null, budgetRange: null })}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 text-sm font-medium hover:bg-purple-500/20 transition-colors"
                >
                  ⭐ Top Rated
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
