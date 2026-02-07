import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  IndianUserProfile, 
  IndianMenuItem, 
  IndianRestaurant, 
  FavoriteItem, 
  WeeklyMealPlan, 
  DailyMealPlan,
  MealPlanEntry,
  Achievement,
  FoodRating,
  ShoppingList,
  DietaryType,
  RegionalCuisine,
  SpiceLevel,
  FoodStyle,
  UserGoal,
  MealType
} from '@/types/indian-food';
import { indianMenuItems, indianRestaurants, getMealContext } from '@/data/indian-food-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface IndianFoodContextType {
  // User Profile
  userProfile: IndianUserProfile | null;
  setUserProfile: (profile: IndianUserProfile) => void;
  updateProfile: (updates: Partial<IndianUserProfile>) => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
  
  // Menu Items & Restaurants
  menuItems: IndianMenuItem[];
  restaurants: IndianRestaurant[];
  
  // Favorites
  favorites: FavoriteItem[];
  addFavorite: (item: IndianMenuItem) => void;
  removeFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  
  // Meal Planning
  mealPlan: WeeklyMealPlan;
  addToMealPlan: (date: string, mealType: keyof DailyMealPlan, entry: MealPlanEntry) => void;
  removeFromMealPlan: (date: string, mealType: keyof DailyMealPlan) => void;
  autoGenerateMealPlan: () => void;
  
  // Ratings
  ratings: Record<string, FoodRating>;
  rateFood: (itemId: string, rating: FoodRating) => void;
  
  // Shopping List
  shoppingList: ShoppingList | null;
  generateShoppingList: () => void;
  toggleShoppingItem: (category: string, itemName: string) => void;
  
  // Achievements
  achievements: Achievement[];
  
  // Recommendations
  getRecommendations: (limit?: number) => IndianMenuItem[];
  getTrendingItems: (limit?: number) => IndianMenuItem[];
  getItemsByBudget: (budget: number) => IndianMenuItem[];
  getItemsByMealType: (mealType: MealType) => IndianMenuItem[];
  
  // Language
  language: 'english' | 'hindi' | 'both';
  setLanguage: (lang: 'english' | 'hindi' | 'both') => void;
}

const IndianFoodContext = createContext<IndianFoodContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  profile: 'indian_food:profile',
  favorites: 'indian_food:favorites',
  mealPlan: 'indian_food:mealplan',
  ratings: 'indian_food:ratings',
  shoppingList: 'indian_food:shopping',
  achievements: 'indian_food:achievements',
  language: 'indian_food:language',
};

// Default achievements
const defaultAchievements: Achievement[] = [
  { id: 'regional_explorer', nameEn: 'Regional Explorer', nameHi: 'क्षेत्रीय खोजकर्ता', description: 'Try 8 different regional cuisines', icon: '🗺️', progress: { current: 0, target: 8 } },
  { id: 'street_food_lover', nameEn: 'Street Food Lover', nameHi: 'स्ट्रीट फूड प्रेमी', description: 'Try 20 street food items', icon: '🍲', progress: { current: 0, target: 20 } },
  { id: 'spice_king', nameEn: 'Spice King', nameHi: 'मसाला राजा', description: 'Try 10 extra spicy dishes', icon: '🌶️', progress: { current: 0, target: 10 } },
  { id: 'budget_master', nameEn: 'Budget Master', nameHi: 'बजट मास्टर', description: 'Save ₹5000 on meals', icon: '💰', progress: { current: 0, target: 5000 } },
  { id: 'home_chef', nameEn: 'Home Chef', nameHi: 'घर का शेफ', description: 'Cook 15 meals at home', icon: '👨‍🍳', progress: { current: 0, target: 15 } },
];

export function IndianFoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Initialize state from localStorage
  const [userProfile, setUserProfileState] = useState<IndianUserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.profile);
    return saved ? JSON.parse(saved) : null;
  });
  
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.favorites);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.mealPlan);
    return saved ? JSON.parse(saved) : {};
  });
  
  const [ratings, setRatings] = useState<Record<string, FoodRating>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ratings);
    return saved ? JSON.parse(saved) : {};
  });
  
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.shoppingList);
    return saved ? JSON.parse(saved) : null;
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.achievements);
    return saved ? JSON.parse(saved) : defaultAchievements;
  });
  
  const [language, setLanguageState] = useState<'english' | 'hindi' | 'both'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.language);
    return (saved as 'english' | 'hindi' | 'both') || 'both';
  });

  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isFavoritesLoaded, setIsFavoritesLoaded] = useState(false);
  const [isMealPlanLoaded, setIsMealPlanLoaded] = useState(false);

  // Load profile, favorites, and meal plans from database when user is authenticated
  useEffect(() => {
    async function loadDataFromDB() {
      if (!user) {
        setIsProfileLoaded(false);
        setIsFavoritesLoaded(false);
        setIsMealPlanLoaded(false);
        return;
      }

      try {
        // Load profile, favorites, and meal plans in parallel
        const [profileResult, favoritesResult, mealPlansResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('favorites').select('*').eq('user_id', user.id),
          supabase.from('meal_plans').select('*').eq('user_id', user.id),
        ]);

        // Handle profile
        if (profileResult.error) {
          console.error('Error loading profile:', profileResult.error);
        } else if (profileResult.data) {
          const profile = profileResult.data;
          const dbProfile: IndianUserProfile = {
            name: profile.name || user.email?.split('@')[0] || 'User',
            email: profile.email || user.email,
            location: {
              city: profile.city || '',
              state: profile.state || '',
            },
            dietary: (profile.dietary as DietaryType) || 'vegetarian',
            regionalPreferences: (profile.regional_preferences as RegionalCuisine[]) || ['north_indian', 'south_indian'],
            spiceLevel: (profile.spice_level as SpiceLevel) || 'medium',
            budgetMin: profile.budget_min || 100,
            budgetMax: profile.budget_max || 500,
            foodStyles: (profile.food_styles as FoodStyle[]) || ['home_style', 'restaurant_style'],
            goals: (profile.goals as UserGoal[]) || ['eat_healthier'],
            language: 'both',
            onboardingComplete: true,
            createdAt: new Date(profile.created_at),
          };
          setUserProfileState(dbProfile);
        }
        setIsProfileLoaded(true);

        // Handle favorites
        if (favoritesResult.error) {
          console.error('Error loading favorites:', favoritesResult.error);
        } else if (favoritesResult.data && favoritesResult.data.length > 0) {
          const dbFavorites: FavoriteItem[] = favoritesResult.data.map(fav => ({
            id: fav.item_id,
            nameEn: fav.name_en,
            nameHi: fav.name_hi || '',
            cuisine: fav.cuisine as RegionalCuisine,
            regional: fav.regional || '',
            image: fav.image || '',
            price: { min: Number(fav.price_min) || 0, max: Number(fav.price_max) || 0 },
            rating: Number(fav.rating) || 4.5,
            spiceLevel: (fav.spice_level as SpiceLevel) || 'medium',
            dietary: (fav.dietary as DietaryType[]) || [],
            savedAt: new Date(fav.saved_at),
          }));
          setFavorites(dbFavorites);
        }
        setIsFavoritesLoaded(true);

        // Handle meal plans
        if (mealPlansResult.error) {
          console.error('Error loading meal plans:', mealPlansResult.error);
        } else if (mealPlansResult.data && mealPlansResult.data.length > 0) {
          const dbMealPlan: WeeklyMealPlan = {};
          mealPlansResult.data.forEach(mp => {
            const dateStr = mp.plan_date;
            if (!dbMealPlan[dateStr]) {
              dbMealPlan[dateStr] = {};
            }
            dbMealPlan[dateStr][mp.meal_type as keyof DailyMealPlan] = {
              id: mp.item_id,
              nameEn: mp.name_en,
              nameHi: mp.name_hi || '',
              cuisine: mp.cuisine as RegionalCuisine,
              price: Number(mp.price) || 0,
              calories: Number(mp.calories) || 0,
              cookTime: mp.cook_time || undefined,
              image: mp.image || undefined,
            };
          });
          setMealPlan(dbMealPlan);
        }
        setIsMealPlanLoaded(true);
      } catch (err) {
        console.error('Error loading data:', err);
        setIsProfileLoaded(true);
        setIsFavoritesLoaded(true);
        setIsMealPlanLoaded(true);
      }
    }

    loadDataFromDB();
  }, [user]);

  // Sync profile to database when it changes
  const syncProfileToDB = useCallback(async (profile: IndianUserProfile) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          city: profile.location?.city,
          state: profile.location?.state,
          dietary: profile.dietary,
          regional_preferences: profile.regionalPreferences,
          spice_level: profile.spiceLevel,
          budget_min: profile.budgetMin,
          budget_max: profile.budgetMax,
          food_styles: profile.foodStyles,
          goals: profile.goals,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error syncing profile:', error);
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
    }
  }, [user]);

  // Persist to localStorage and sync to DB
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(userProfile));
      // Only sync to DB if profile is loaded and user is authenticated
      if (isProfileLoaded && user) {
        syncProfileToDB(userProfile);
      }
    }
  }, [userProfile, isProfileLoaded, user, syncProfileToDB]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    if (shoppingList) {
      localStorage.setItem(STORAGE_KEYS.shoppingList, JSON.stringify(shoppingList));
    }
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  // Profile functions
  const setUserProfile = useCallback((profile: IndianUserProfile) => {
    setUserProfileState(profile);
  }, []);

  const updateProfile = useCallback((updates: Partial<IndianUserProfile>) => {
    setUserProfileState(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const isOnboardingComplete = userProfile?.onboardingComplete ?? false;

  const completeOnboarding = useCallback(() => {
    setUserProfileState(prev => prev ? { ...prev, onboardingComplete: true } : null);
  }, []);

  // Sync favorite to database
  const syncFavoriteToDB = useCallback(async (favorite: FavoriteItem, action: 'add' | 'remove') => {
    if (!user) return;

    try {
      if (action === 'add') {
        const { error } = await supabase.from('favorites').upsert({
          user_id: user.id,
          item_id: favorite.id,
          name_en: favorite.nameEn,
          name_hi: favorite.nameHi,
          cuisine: favorite.cuisine,
          regional: favorite.regional,
          image: favorite.image,
          price_min: favorite.price.min,
          price_max: favorite.price.max,
          rating: favorite.rating,
          spice_level: favorite.spiceLevel,
          dietary: favorite.dietary,
          saved_at: favorite.savedAt.toISOString(),
        }, { onConflict: 'user_id,item_id' });

        if (error) console.error('Error syncing favorite:', error);
      } else {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', favorite.id);

        if (error) console.error('Error removing favorite:', error);
      }
    } catch (err) {
      console.error('Error syncing favorite:', err);
    }
  }, [user]);

  // Sync meal plan entry to database
  const syncMealPlanToDB = useCallback(async (date: string, mealType: string, entry: MealPlanEntry | null) => {
    if (!user) return;

    try {
      if (entry) {
        const { error } = await supabase.from('meal_plans').upsert({
          user_id: user.id,
          plan_date: date,
          meal_type: mealType,
          item_id: entry.id,
          name_en: entry.nameEn,
          name_hi: entry.nameHi,
          cuisine: entry.cuisine,
          price: entry.price,
          calories: entry.calories,
          cook_time: entry.cookTime,
          image: entry.image,
        }, { onConflict: 'user_id,plan_date,meal_type' });

        if (error) console.error('Error syncing meal plan:', error);
      } else {
        const { error } = await supabase
          .from('meal_plans')
          .delete()
          .eq('user_id', user.id)
          .eq('plan_date', date)
          .eq('meal_type', mealType);

        if (error) console.error('Error removing meal plan entry:', error);
      }
    } catch (err) {
      console.error('Error syncing meal plan:', err);
    }
  }, [user]);

  // Favorites functions
  const addFavorite = useCallback((item: IndianMenuItem) => {
    const favoriteItem: FavoriteItem = {
      id: item.id,
      nameEn: item.nameEn,
      nameHi: item.nameHi,
      cuisine: item.region,
      regional: item.region,
      image: item.image,
      price: item.price,
      rating: 4.5,
      spiceLevel: item.spiceLevel,
      dietary: item.dietary,
      savedAt: new Date(),
    };
    setFavorites(prev => [...prev, favoriteItem]);
    
    // Sync to database if user is authenticated
    if (user && isFavoritesLoaded) {
      syncFavoriteToDB(favoriteItem, 'add');
    }
  }, [user, isFavoritesLoaded, syncFavoriteToDB]);

  const removeFavorite = useCallback((itemId: string) => {
    const favorite = favorites.find(f => f.id === itemId);
    setFavorites(prev => prev.filter(f => f.id !== itemId));
    
    // Sync to database if user is authenticated
    if (favorite && user && isFavoritesLoaded) {
      syncFavoriteToDB(favorite, 'remove');
    }
  }, [favorites, user, isFavoritesLoaded, syncFavoriteToDB]);

  const isFavorite = useCallback((itemId: string) => {
    return favorites.some(f => f.id === itemId);
  }, [favorites]);

  // Meal planning functions
  const addToMealPlan = useCallback((date: string, mealType: keyof DailyMealPlan, entry: MealPlanEntry) => {
    setMealPlan(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [mealType]: entry,
      },
    }));
    
    // Sync to database if user is authenticated
    if (user && isMealPlanLoaded) {
      syncMealPlanToDB(date, mealType, entry);
    }
  }, [user, isMealPlanLoaded, syncMealPlanToDB]);

  const removeFromMealPlan = useCallback((date: string, mealType: keyof DailyMealPlan) => {
    setMealPlan(prev => {
      const updated = { ...prev };
      if (updated[date]) {
        delete updated[date][mealType];
      }
      return updated;
    });
    
    // Sync to database if user is authenticated
    if (user && isMealPlanLoaded) {
      syncMealPlanToDB(date, mealType, null);
    }
  }, [user, isMealPlanLoaded, syncMealPlanToDB]);

  const autoGenerateMealPlan = useCallback(async () => {
    const today = new Date();
    const newPlan: WeeklyMealPlan = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get random items for each meal
      const breakfastItems = indianMenuItems.filter(item => item.mealType.includes('breakfast'));
      const lunchItems = indianMenuItems.filter(item => item.mealType.includes('lunch'));
      const snackItems = indianMenuItems.filter(item => item.mealType.includes('snacks'));
      const dinnerItems = indianMenuItems.filter(item => item.mealType.includes('dinner'));
      
      const randomItem = (items: IndianMenuItem[]): MealPlanEntry | undefined => {
        if (items.length === 0) return undefined;
        const item = items[Math.floor(Math.random() * items.length)];
        return {
          id: item.id,
          nameEn: item.nameEn,
          nameHi: item.nameHi,
          cuisine: item.region,
          price: item.price.min,
          calories: item.calories,
          cookTime: item.cookTime,
          image: item.image,
        };
      };
      
      newPlan[dateStr] = {
        breakfast: randomItem(breakfastItems),
        lunch: randomItem(lunchItems),
        snacks: randomItem(snackItems),
        dinner: randomItem(dinnerItems),
      };
    }
    
    setMealPlan(newPlan);

    // Sync all entries to database if user is authenticated
    if (user && isMealPlanLoaded) {
      const mealTypes: (keyof DailyMealPlan)[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
      for (const [dateStr, dayPlan] of Object.entries(newPlan)) {
        for (const mealType of mealTypes) {
          const entry = dayPlan[mealType];
          if (entry) {
            syncMealPlanToDB(dateStr, mealType, entry);
          }
        }
      }
    }
  }, [user, isMealPlanLoaded, syncMealPlanToDB]);

  // Rating functions
  const rateFood = useCallback((itemId: string, rating: FoodRating) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
  }, []);

  // Shopping list functions
  const generateShoppingList = useCallback(() => {
    // Generate shopping list from meal plan
    const ingredientMap: Record<string, { items: { name: string; nameHi: string; quantity: string }[] }> = {
      vegetables: { items: [] },
      pulses: { items: [] },
      spices: { items: [] },
      dairy: { items: [] },
      grains: { items: [] },
    };
    
    // Simplified shopping list generation
    Object.values(mealPlan).forEach(day => {
      Object.values(day).forEach(meal => {
        if (meal) {
          const menuItem = indianMenuItems.find(item => item.id === meal.id);
          if (menuItem) {
            menuItem.ingredients.forEach(ing => {
              // Add to vegetables by default (simplified)
              if (!ingredientMap.vegetables.items.find(i => i.name === ing.en)) {
                ingredientMap.vegetables.items.push({
                  name: ing.en,
                  nameHi: ing.hi,
                  quantity: '500g',
                });
              }
            });
          }
        }
      });
    });
    
    const list: ShoppingList = {
      weekStarting: new Date().toISOString().split('T')[0],
      items: [
        { category: 'Vegetables', categoryHi: 'सब्ज़ियाँ', items: ingredientMap.vegetables.items.map(i => ({ ...i, checked: false })) },
        { category: 'Pulses', categoryHi: 'दालें', items: [{ name: 'Toor dal', nameHi: 'अरहर दाल', quantity: '1 kg', checked: false }] },
        { category: 'Spices', categoryHi: 'मसाले', items: [{ name: 'Garam Masala', nameHi: 'गरम मसाला', quantity: '100g', checked: false }] },
        { category: 'Dairy', categoryHi: 'दूध उत्पाद', items: [{ name: 'Milk', nameHi: 'दूध', quantity: '2 L', checked: false }] },
        { category: 'Grains', categoryHi: 'अनाज', items: [{ name: 'Rice', nameHi: 'चावल', quantity: '2 kg', checked: false }] },
      ],
      totalEstimate: 1500,
    };
    
    setShoppingList(list);
  }, [mealPlan]);

  const toggleShoppingItem = useCallback((category: string, itemName: string) => {
    setShoppingList(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(cat => {
          if (cat.category === category) {
            return {
              ...cat,
              items: cat.items.map(item => 
                item.name === itemName ? { ...item, checked: !item.checked } : item
              ),
            };
          }
          return cat;
        }),
      };
    });
  }, []);

  // Recommendation functions
  const getRecommendations = useCallback((limit: number = 10): IndianMenuItem[] => {
    if (!userProfile) return indianMenuItems.slice(0, limit);
    
    const mealContext = getMealContext();
    
    // Filter by user preferences
    let filtered = indianMenuItems.filter(item => {
      // Filter by dietary
      if (userProfile.dietary === 'vegetarian' && !item.isVeg) return false;
      if (userProfile.dietary === 'vegan' && !item.dietary.includes('vegan')) return false;
      if (userProfile.dietary === 'jain' && !item.isJainFriendly) return false;
      
      // Filter by budget
      if (item.price.min > userProfile.budgetMax) return false;
      
      // Prefer items matching meal time
      if (!item.mealType.includes(mealContext.meal)) return false;
      
      return true;
    });
    
    // Sort by regional preference
    filtered.sort((a, b) => {
      const aPreferred = userProfile.regionalPreferences.includes(a.region) ? 1 : 0;
      const bPreferred = userProfile.regionalPreferences.includes(b.region) ? 1 : 0;
      return bPreferred - aPreferred;
    });
    
    return filtered.slice(0, limit);
  }, [userProfile]);

  const getTrendingItems = useCallback((limit: number = 10): IndianMenuItem[] => {
    return indianMenuItems.filter(item => item.isBestseller).slice(0, limit);
  }, []);

  const getItemsByBudget = useCallback((budget: number): IndianMenuItem[] => {
    return indianMenuItems.filter(item => item.price.max <= budget);
  }, []);

  const getItemsByMealType = useCallback((mealType: MealType): IndianMenuItem[] => {
    return indianMenuItems.filter(item => item.mealType.includes(mealType));
  }, []);

  const setLanguage = useCallback((lang: 'english' | 'hindi' | 'both') => {
    setLanguageState(lang);
  }, []);

  const value: IndianFoodContextType = {
    userProfile,
    setUserProfile,
    updateProfile,
    isOnboardingComplete,
    completeOnboarding,
    menuItems: indianMenuItems,
    restaurants: indianRestaurants,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    mealPlan,
    addToMealPlan,
    removeFromMealPlan,
    autoGenerateMealPlan,
    ratings,
    rateFood,
    shoppingList,
    generateShoppingList,
    toggleShoppingItem,
    achievements,
    getRecommendations,
    getTrendingItems,
    getItemsByBudget,
    getItemsByMealType,
    language,
    setLanguage,
  };

  return <IndianFoodContext.Provider value={value}>{children}</IndianFoodContext.Provider>;
}

export function useIndianFood() {
  const context = useContext(IndianFoodContext);
  if (context === undefined) {
    throw new Error('useIndianFood must be used within an IndianFoodProvider');
  }
  return context;
}
