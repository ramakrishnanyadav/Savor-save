import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, MapPin, Heart, Phone, Share2, ChevronRight, Utensils, Flame, Check } from 'lucide-react';
import { Restaurant, MenuItem } from '@/types';
import { formatINR, cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (restaurant: Restaurant, items: MenuItem[]) => void;
}

export function RestaurantDetailModal({ restaurant, isOpen, onClose, onAddExpense }: RestaurantDetailModalProps) {
  const { toggleFavorite, isFavorite } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [showVegOnly, setShowVegOnly] = useState(false);

  if (!restaurant) return null;

  const categories = ['all', 'starter', 'main', 'dessert', 'beverage', 'combo'];
  const filteredItems = restaurant.menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesVeg = !showVegOnly || item.isVeg;
    return matchesCategory && matchesVeg;
  });

  const toggleItem = (item: MenuItem) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleOrder = () => {
    if (selectedItems.length > 0) {
      onAddExpense(restaurant, selectedItems);
      setSelectedItems([]);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 md:inset-4 md:top-auto md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:max-w-3xl md:max-h-[90vh] bg-card rounded-t-3xl md:rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header Image */}
            <div className="relative h-48 md:h-64 flex-shrink-0">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Actions */}
              <div className="absolute top-4 left-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(restaurant.id)}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <Heart className={cn(
                    "w-5 h-5",
                    isFavorite(restaurant.id) ? "fill-rose-500 text-rose-500" : "text-white"
                  )} />
                </motion.button>
                <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Restaurant Info */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{restaurant.name}</h2>
                    <p className="text-white/80">{restaurant.cuisine.join(' • ')}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    {restaurant.rating}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{restaurant.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm ml-auto">
                <span className="font-semibold text-emerald-600">{formatINR(restaurant.avgCostForTwo)}</span>
                <span className="text-muted-foreground">for two</span>
              </div>
            </div>

            {/* Menu Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Menu</h3>
                  <button
                    onClick={() => setShowVegOnly(!showVegOnly)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      showVegOnly
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    <span className="w-3 h-3 border-2 border-current rounded-sm flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    </span>
                    Veg Only
                  </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all',
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {cat === 'all' ? 'All Items' : cat}
                    </button>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleItem(item)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        )}
                      >
                        {/* Veg/Non-veg indicator */}
                        <div className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                          item.isVeg ? 'border-emerald-500' : 'border-red-500'
                        )}>
                          <span className={cn(
                            'w-2.5 h-2.5 rounded-full',
                            item.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                          )} />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{item.name}</h4>
                            {item.isBestseller && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
                                ⭐ Bestseller
                              </span>
                            )}
                            {item.isSpicy && (
                              <Flame className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>

                        {/* Price & Select */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-bold">{formatINR(item.price)}</span>
                          <div className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="flex items-center justify-between p-4 border-t border-border bg-card"
              >
                <div>
                  <p className="text-sm text-muted-foreground">{selectedItems.length} item(s) selected</p>
                  <p className="text-xl font-bold">{formatINR(totalAmount)}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrder}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Add to Expenses
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
