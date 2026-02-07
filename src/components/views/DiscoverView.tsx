import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Star, Clock, MapPin } from 'lucide-react';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { cuisineCategories, dietaryOptions } from '@/data/mockData';
import { cn, getPriceRangeDisplay } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

type SortOption = 'recommended' | 'rating' | 'price-low' | 'price-high' | 'distance';

export function DiscoverView() {
  const { restaurants, toggleFavorite, isFavorite } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([1, 4]);
  const [showFilters, setShowFilters] = useState(false);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleDietary = (option: string) => {
    setSelectedDietary((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const togglePriceRange = (price: number) => {
    setPriceRange((prev) => {
      if (prev.includes(price)) {
        const newRange = prev.filter(p => p !== price);
        return newRange.length === 0 ? [1, 2, 3, 4] : newRange;
      }
      return [...prev, price].sort();
    });
  };

  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedDietary([]);
    setPriceRange([1, 2, 3, 4]);
    setShowOpenOnly(false);
    setMinRating(0);
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCuisines.length > 0) count += selectedCuisines.length;
    if (selectedDietary.length > 0) count += selectedDietary.length;
    if (priceRange.length < 4) count += 1;
    if (showOpenOnly) count += 1;
    if (minRating > 0) count += 1;
    return count;
  }, [selectedCuisines, selectedDietary, priceRange, showOpenOnly, minRating]);

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    let results = restaurants.filter((restaurant) => {
      const matchesSearch =
        searchQuery === '' ||
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCuisine =
        selectedCuisines.length === 0 ||
        restaurant.cuisine.some((c) => selectedCuisines.includes(c));

      const matchesDietary =
        selectedDietary.length === 0 ||
        restaurant.dietaryOptions.some((d) => selectedDietary.includes(d));

      const matchesPrice = priceRange.includes(restaurant.priceRange);

      const matchesOpen = !showOpenOnly || restaurant.isOpen;

      const matchesRating = restaurant.rating >= minRating;

      return matchesSearch && matchesCuisine && matchesDietary && matchesPrice && matchesOpen && matchesRating;
    });

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        results.sort((a, b) => a.priceRange - b.priceRange);
        break;
      case 'price-high':
        results.sort((a, b) => b.priceRange - a.priceRange);
        break;
      case 'distance':
        results.sort((a, b) => a.distance - b.distance);
        break;
      default:
        // Recommended: trending first, then by rating
        results.sort((a, b) => {
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return b.rating - a.rating;
        });
    }

    return results;
  }, [restaurants, searchQuery, selectedCuisines, selectedDietary, priceRange, showOpenOnly, minRating, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest First' },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover</h1>
        <p className="text-muted-foreground">
          Find your next favorite meal
        </p>
      </motion.div>

      {/* Search & Filter Bar */}
      <div className="sticky top-20 z-30 -mx-4 px-4 md:-mx-8 md:px-8 py-4 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants, cuisines..."
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'relative p-3 rounded-xl transition-all',
              showFilters
                ? 'gradient-bg text-white shadow-glow'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Quick Cuisine Chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {cuisineCategories.slice(0, 10).map((cuisine) => (
            <motion.button
              key={cuisine}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleCuisine(cuisine)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedCuisines.includes(cuisine)
                  ? 'gradient-bg text-white shadow-lg'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {cuisine}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-card border border-border shadow-lg space-y-5">
              {/* Quick Toggles Row */}
              <div className="flex flex-wrap gap-3">
                {/* Open Now */}
                <button
                  onClick={() => setShowOpenOnly(!showOpenOnly)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                    showOpenOnly
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <Clock className="w-4 h-4" />
                  Open Now
                </button>

                {/* Rating 4+ */}
                <button
                  onClick={() => setMinRating(minRating === 4 ? 0 : 4)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                    minRating === 4
                      ? 'bg-amber-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <Star className="w-4 h-4" />
                  4+ Rating
                </button>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Price Range</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((price) => (
                    <motion.button
                      key={price}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => togglePriceRange(price)}
                      className={cn(
                        'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border-2',
                        priceRange.includes(price)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {getPriceRangeDisplay(price)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Dietary Options */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDietary(option)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all border-2',
                        selectedDietary.includes(option)
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 gradient-bg text-white rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-shadow"
                >
                  Show {filteredRestaurants.length} Results
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Header with Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredRestaurants.length}</span> restaurants found
        </p>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
          >
            {sortOptions.find(o => o.value === sortBy)?.label}
            <ChevronDown className={cn('w-4 h-4 transition-transform', showSortDropdown && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showSortDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSortDropdown(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-card border border-border shadow-xl z-50"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm transition-colors',
                        sortBy === option.value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Filter Tags */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {showOpenOnly && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
              >
                <Clock className="w-3 h-3" />
                Open Now
                <button 
                  onClick={() => setShowOpenOnly(false)}
                  className="ml-1 hover:bg-emerald-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            )}
            {minRating > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium"
              >
                <Star className="w-3 h-3" />
                {minRating}+ Rating
                <button 
                  onClick={() => setMinRating(0)}
                  className="ml-1 hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            )}
            {selectedCuisines.map((cuisine) => (
              <motion.span
                key={cuisine}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {cuisine}
                <button 
                  onClick={() => toggleCuisine(cuisine)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
            {selectedDietary.map((option) => (
              <motion.span
                key={option}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
              >
                {option}
                <button 
                  onClick={() => toggleDietary(option)}
                  className="ml-1 hover:bg-emerald-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant, index) => (
          <RestaurantCard 
            key={restaurant.id} 
            restaurant={restaurant} 
            index={index}
            isFavorite={isFavorite(restaurant.id)}
            onToggleFavorite={() => toggleFavorite(restaurant.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRestaurants.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No restaurants found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 gradient-bg text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}
    </div>
  );
}