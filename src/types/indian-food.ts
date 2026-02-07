// Complete Indian Food App Types

// Dietary options
export type DietaryType = 'everything' | 'vegetarian' | 'vegan' | 'jain' | 'eggetarian' | 'non-vegetarian';

// Spice levels
export type SpiceLevel = 'mild' | 'medium' | 'spicy' | 'extra-spicy';

// Regional cuisines
export type RegionalCuisine = 
  | 'north_indian' 
  | 'south_indian' 
  | 'bengali' 
  | 'gujarati' 
  | 'maharashtrian' 
  | 'rajasthani' 
  | 'coastal' 
  | 'street_food' 
  | 'indo_chinese' 
  | 'continental_indian'
  | 'kashmiri'
  | 'chettinad'
  | 'northeast';

// Food styles
export type FoodStyle = 'home_style' | 'restaurant_style' | 'street_food' | 'quick_bites' | 'traditional';

// Meal types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'desserts';

// User goals
export type UserGoal = 'eat_healthier' | 'try_new' | 'save_money' | 'track_nutrition';

// Menu item
export interface IndianMenuItem {
  id: string;
  nameEn: string;
  nameHi: string;
  description: string;
  descriptionHi?: string;
  price: { min: number; max: number };
  calories: number;
  cookTime: number; // in minutes
  spiceLevel: SpiceLevel;
  dietary: DietaryType[];
  isVeg: boolean;
  isJainFriendly: boolean;
  isBestseller: boolean;
  image: string;
  region: RegionalCuisine;
  mealType: MealType[];
  ingredients: { en: string; hi: string }[];
  servingSuggestions?: string[];
  nutrition?: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

// Indian Restaurant
export interface IndianRestaurant {
  id: string;
  name: string;
  nameHi?: string;
  cuisine: RegionalCuisine[];
  rating: number;
  reviewCount: number;
  priceRange: number; // 1-4
  avgCostForTwo: number;
  distance: number;
  location: string;
  deliveryTime: string;
  image: string;
  isOpen: boolean;
  trending: boolean;
  menuItems: IndianMenuItem[];
  specialities: string[];
}

// User Profile for Indian Food App
export interface IndianUserProfile {
  name: string;
  email?: string;
  phone?: string;
  location: {
    city: string;
    state: string;
    pincode?: string;
  };
  dietary: DietaryType;
  regionalPreferences: RegionalCuisine[];
  spiceLevel: SpiceLevel;
  foodStyles: FoodStyle[];
  budgetMin: number;
  budgetMax: number;
  language: 'english' | 'hindi' | 'both';
  goals: UserGoal[];
  healthGoals?: {
    dailyCalories: number;
    targetWeight?: number;
    currentWeight?: number;
    startDate?: Date;
  };
  avatar?: string;
  onboardingComplete: boolean;
  createdAt: Date;
}

// Meal plan entry
export interface MealPlanEntry {
  id: string;
  nameEn: string;
  nameHi: string;
  cuisine: RegionalCuisine;
  price: number;
  calories: number;
  cookTime?: number;
  image?: string;
}

// Daily meal plan
export interface DailyMealPlan {
  breakfast?: MealPlanEntry;
  lunch?: MealPlanEntry;
  snacks?: MealPlanEntry;
  dinner?: MealPlanEntry;
}

// Weekly meal plan
export interface WeeklyMealPlan {
  [date: string]: DailyMealPlan;
}

// Shopping list item
export interface ShoppingItem {
  name: string;
  nameHi: string;
  quantity: string;
  checked: boolean;
}

// Shopping list category
export interface ShoppingCategory {
  category: string;
  categoryHi: string;
  items: ShoppingItem[];
}

// Shopping list
export interface ShoppingList {
  weekStarting: string;
  items: ShoppingCategory[];
  totalEstimate: number;
}

// Achievement
export interface Achievement {
  id: string;
  nameEn: string;
  nameHi: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: { current: number; target: number };
}

// Rating
export interface FoodRating {
  stars: number;
  review?: string;
  reviewHi?: string;
  tags: string[];
  ratedAt: Date;
  authenticity?: number;
}

// Favorite item
export interface FavoriteItem {
  id: string;
  nameEn: string;
  nameHi: string;
  cuisine: RegionalCuisine;
  regional: string;
  image: string;
  price: { min: number; max: number };
  rating: number;
  spiceLevel: SpiceLevel;
  dietary: DietaryType[];
  savedAt: Date;
}

// Budget ranges in INR
export interface BudgetRangeINR {
  id: string;
  label: string;
  labelHi: string;
  min: number;
  max: number;
  description: string;
  descriptionHi: string;
}

export const BUDGET_RANGES_INR: BudgetRangeINR[] = [
  { id: 'budget', label: '₹50 - ₹150', labelHi: '₹50 - ₹150', min: 50, max: 150, description: 'Street food & snacks', descriptionHi: 'स्ट्रीट फूड और नाश्ता' },
  { id: 'pocket', label: '₹150 - ₹300', labelHi: '₹150 - ₹300', min: 150, max: 300, description: 'Quick meals', descriptionHi: 'जल्दी का खाना' },
  { id: 'moderate', label: '₹300 - ₹500', labelHi: '₹300 - ₹500', min: 300, max: 500, description: 'Good meals', descriptionHi: 'अच्छा भोजन' },
  { id: 'premium', label: '₹500 - ₹800', labelHi: '₹500 - ₹800', min: 500, max: 800, description: 'Restaurant dining', descriptionHi: 'रेस्टोरेंट डाइनिंग' },
  { id: 'fine', label: '₹800 - ₹1,500', labelHi: '₹800 - ₹1,500', min: 800, max: 1500, description: 'Fine dining', descriptionHi: 'फाइन डाइनिंग' },
  { id: 'luxury', label: '₹1,500+', labelHi: '₹1,500+', min: 1500, max: 5000, description: 'Luxury experience', descriptionHi: 'लक्ज़री अनुभव' },
];

// Regional cuisine display data
export const REGIONAL_CUISINES: { id: RegionalCuisine; nameEn: string; nameHi: string; icon: string; description: string }[] = [
  { id: 'north_indian', nameEn: 'North Indian', nameHi: 'उत्तर भारतीय', icon: '🍛', description: 'रोटी-सब्ज़ी, पराठे, पंजाबी' },
  { id: 'south_indian', nameEn: 'South Indian', nameHi: 'दक्षिण भारतीय', icon: '🥘', description: 'दोसा, इडली, सांभर' },
  { id: 'bengali', nameEn: 'Bengali', nameHi: 'बंगाली', icon: '🐟', description: 'मछली, रसगुल्ला, मिष्टी' },
  { id: 'gujarati', nameEn: 'Gujarati', nameHi: 'गुजराती', icon: '🥗', description: 'ढोकला, खांडवी, थेपला' },
  { id: 'maharashtrian', nameEn: 'Maharashtrian', nameHi: 'महाराष्ट्रीयन', icon: '🍲', description: 'वड़ा पाव, पोहा, मिसल' },
  { id: 'rajasthani', nameEn: 'Rajasthani', nameHi: 'राजस्थानी', icon: '🏜️', description: 'दाल बाटी, गट्टे' },
  { id: 'coastal', nameEn: 'Coastal', nameHi: 'तटीय', icon: '🦐', description: 'गोवा, केरल, कोंकण' },
  { id: 'street_food', nameEn: 'Street Food', nameHi: 'स्ट्रीट फूड', icon: '🍟', description: 'चाट, पानीपुरी, समोसा' },
  { id: 'indo_chinese', nameEn: 'Indo-Chinese', nameHi: 'इंडो-चाइनीज़', icon: '🥡', description: 'मंचूरियन, नूडल्स, मोमोज़' },
  { id: 'continental_indian', nameEn: 'Continental-Indian', nameHi: 'कॉन्टिनेंटल-इंडियन', icon: '🍝', description: 'फ्यूज़न फूड' },
];

// Dietary options display
export const DIETARY_OPTIONS: { id: DietaryType; nameEn: string; nameHi: string; icon: string }[] = [
  { id: 'everything', nameEn: 'Everything', nameHi: 'सब कुछ', icon: '🍽️' },
  { id: 'vegetarian', nameEn: 'Vegetarian', nameHi: 'शाकाहारी', icon: '🥗' },
  { id: 'vegan', nameEn: 'Vegan', nameHi: 'शुद्ध शाकाहारी', icon: '🌱' },
  { id: 'jain', nameEn: 'Jain', nameHi: 'जैन', icon: '🙏' },
  { id: 'eggetarian', nameEn: 'Eggetarian', nameHi: 'अंडा खाने वाले', icon: '🥚' },
  { id: 'non-vegetarian', nameEn: 'Non-Vegetarian', nameHi: 'मांसाहारी', icon: '🍗' },
];

// Spice levels display
export const SPICE_LEVELS: { id: SpiceLevel; nameEn: string; nameHi: string; icon: string; chilies: number }[] = [
  { id: 'mild', nameEn: 'Mild', nameHi: 'हल्का तीखा', icon: '🌶️', chilies: 1 },
  { id: 'medium', nameEn: 'Medium', nameHi: 'मध्यम तीखा', icon: '🌶️🌶️', chilies: 2 },
  { id: 'spicy', nameEn: 'Spicy', nameHi: 'तीखा', icon: '🌶️🌶️🌶️', chilies: 3 },
  { id: 'extra-spicy', nameEn: 'Extra Spicy', nameHi: 'एक्स्ट्रा तीखा', icon: '🌶️🌶️🌶️🌶️', chilies: 4 },
];

// Food styles display
export const FOOD_STYLES: { id: FoodStyle; nameEn: string; nameHi: string; icon: string }[] = [
  { id: 'home_style', nameEn: 'Home-style', nameHi: 'घर जैसा खाना', icon: '🏠' },
  { id: 'restaurant_style', nameEn: 'Restaurant-style', nameHi: 'रेस्टोरेंट स्टाइल', icon: '🍽️' },
  { id: 'street_food', nameEn: 'Street Food', nameHi: 'स्ट्रीट फूड', icon: '🛒' },
  { id: 'quick_bites', nameEn: 'Quick Bites', nameHi: 'जल्दी खाना', icon: '⚡' },
  { id: 'traditional', nameEn: 'Traditional', nameHi: 'पारंपरिक', icon: '🪔' },
];

// User goals display
export const USER_GOALS: { id: UserGoal; nameEn: string; nameHi: string; icon: string }[] = [
  { id: 'eat_healthier', nameEn: 'Eat healthier', nameHi: 'स्वस्थ खाना', icon: '💪' },
  { id: 'try_new', nameEn: 'Try new dishes', nameHi: 'नए व्यंजन', icon: '🌍' },
  { id: 'save_money', nameEn: 'Save money', nameHi: 'पैसे बचाएं', icon: '💰' },
  { id: 'track_nutrition', nameEn: 'Track nutrition', nameHi: 'पोषण ट्रैक करें', icon: '📊' },
];
