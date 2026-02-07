import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { REGIONAL_CUISINES, IndianMenuItem, MealType } from '@/types/indian-food';
import { useIndianFood } from '@/context/IndianFoodContext';
import { cn } from '@/lib/utils';

interface CategoryBrowserProps {
  onSelectItem: (item: IndianMenuItem) => void;
}

type CategoryType = 'regional' | 'meal' | 'diet' | 'time' | 'price' | 'spice';

const categories: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'regional', label: 'By Regional Cuisine', icon: '🍛' },
  { id: 'meal', label: 'By Meal Type', icon: '🕐' },
  { id: 'diet', label: 'By Diet Type', icon: '🥗' },
  { id: 'time', label: 'By Cooking Time', icon: '⚡' },
  { id: 'price', label: 'By Price Range', icon: '💰' },
  { id: 'spice', label: 'By Spice Level', icon: '🌶️' },
];

const mealTypes: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '🍛' },
  { id: 'snacks', label: 'Snacks', icon: '🍿' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'desserts', label: 'Desserts', icon: '🍮' },
];

const dietTypes = [
  { id: 'veg', label: 'Pure Vegetarian', icon: '🟢' },
  { id: 'jain', label: 'Jain Food', icon: '🙏' },
  { id: 'nonveg', label: 'Non-Vegetarian', icon: '🔴' },
  { id: 'highprotein', label: 'High Protein', icon: '💪' },
  { id: 'lowcal', label: 'Low Calorie', icon: '🥬' },
];

const cookingTimes = [
  { id: 'quick', label: 'Quick (15 min)', max: 15 },
  { id: 'medium', label: 'Medium (30 min)', max: 30 },
  { id: 'elaborate', label: 'Elaborate (1 hour+)', max: 999 },
];

const priceRanges = [
  { id: 'budget', label: 'Budget (₹50-150)', min: 50, max: 150 },
  { id: 'mid', label: 'Mid-range (₹150-300)', min: 150, max: 300 },
  { id: 'premium', label: 'Premium (₹300+)', min: 300, max: 9999 },
];

const spiceLevels = [
  { id: 'mild', label: 'Mild', icon: '🌶️' },
  { id: 'medium', label: 'Medium', icon: '🌶️🌶️' },
  { id: 'spicy', label: 'Spicy', icon: '🌶️🌶️🌶️' },
  { id: 'extra-spicy', label: 'Extra Hot', icon: '🌶️🌶️🌶️🌶️' },
];

export function CategoryBrowser({ onSelectItem }: CategoryBrowserProps) {
  const { menuItems } = useIndianFood();
  const [expandedCategory, setExpandedCategory] = useState<CategoryType | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);

  // Get filtered items based on selection
  const filteredItems = useMemo(() => {
    if (!selectedSubcategory) return [];

    return menuItems.filter(item => {
      if (expandedCategory === 'regional') {
        return item.region === selectedSubcategory;
      }
      if (expandedCategory === 'meal') {
        return item.mealType.includes(selectedSubcategory as MealType);
      }
      if (expandedCategory === 'diet') {
        if (selectedSubcategory === 'veg') return item.isVeg;
        if (selectedSubcategory === 'jain') return item.isJainFriendly;
        if (selectedSubcategory === 'nonveg') return !item.isVeg;
        if (selectedSubcategory === 'highprotein') return item.nutrition && item.nutrition.protein > 15;
        if (selectedSubcategory === 'lowcal') return item.calories < 300;
      }
      if (expandedCategory === 'time') {
        const time = cookingTimes.find(t => t.id === selectedSubcategory);
        if (time) return item.cookTime <= time.max;
      }
      if (expandedCategory === 'price') {
        const range = priceRanges.find(r => r.id === selectedSubcategory);
        if (range) return item.price.max >= range.min && item.price.max <= range.max;
      }
      if (expandedCategory === 'spice') {
        return item.spiceLevel === selectedSubcategory;
      }
      return false;
    });
  }, [menuItems, expandedCategory, selectedSubcategory]);

  const toggleCategory = (categoryId: CategoryType) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setSelectedSubcategory(null);
      setShowAllItems(false);
    } else {
      setExpandedCategory(categoryId);
      setSelectedSubcategory(null);
      setShowAllItems(false);
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setShowAllItems(false);
  };

  const getSubcategories = () => {
    switch (expandedCategory) {
      case 'regional':
        return REGIONAL_CUISINES.map(c => ({ id: c.id, label: c.nameEn, icon: c.icon }));
      case 'meal':
        return mealTypes;
      case 'diet':
        return dietTypes;
      case 'time':
        return cookingTimes.map(t => ({ id: t.id, label: t.label, icon: '⏱️' }));
      case 'price':
        return priceRanges.map(r => ({ id: r.id, label: r.label, icon: '💰' }));
      case 'spice':
        return spiceLevels;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category.id} className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Category header */}
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <p className="font-semibold">{category.label}</p>
            </div>
            <motion.div
              animate={{ rotate: expandedCategory === category.id ? 180 : 0 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          {/* Subcategories */}
          <AnimatePresence>
            {expandedCategory === category.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {getSubcategories().map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubcategorySelect(sub.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                          selectedSubcategory === sub.id
                            ? "gradient-bg text-white shadow-lg"
                            : "bg-muted hover:bg-primary/10"
                        )}
                      >
                        {'icon' in sub && <span>{sub.icon}</span>}
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Filtered items */}
                  {selectedSubcategory && filteredItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 space-y-2"
                    >
                      <p className="text-sm text-muted-foreground mb-2">
                        {filteredItems.length} items found
                      </p>
                      {(showAllItems ? filteredItems : filteredItems.slice(0, 5)).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onSelectItem(item)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all text-left"
                        >
                          <img
                            src={item.image}
                            alt={item.nameEn}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.nameEn}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{item.price.min} - {item.price.max}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))}
                      {filteredItems.length > 5 && !showAllItems && (
                        <button 
                          onClick={() => setShowAllItems(true)}
                          className="w-full text-center text-sm text-primary font-medium pt-2 hover:underline"
                        >
                          + {filteredItems.length - 5} more item{filteredItems.length - 5 > 1 ? 's' : ''}
                        </button>
                      )}
                      {showAllItems && filteredItems.length > 5 && (
                        <button 
                          onClick={() => setShowAllItems(false)}
                          className="w-full text-center text-sm text-muted-foreground font-medium pt-2 hover:underline"
                        >
                          Show less
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
