export interface Expense {
  id: string;
  amount: number;
  category: string;
  cuisine: string;
  restaurant: string;
  date: Date;
  paymentMethod: string;
  notes: string;
  receiptUrl?: string;
  splitBill?: { total: number; people: number; yourShare: number };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'starter' | 'main' | 'dessert' | 'beverage' | 'combo';
  isVeg: boolean;
  isSpicy: boolean;
  isBestseller: boolean;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceRange: number;
  avgCostForTwo: number; // Actual cost in INR
  rating: number;
  reviewCount: number;
  distance: number;
  location: string; // Area/locality
  deliveryTime: string;
  imageUrl: string;
  dietaryOptions: string[];
  spiceLevel: number;
  trending: boolean;
  isOpen: boolean;
  menuItems: MenuItem[];
}

export interface Budget {
  monthly: number;
  spent: number;
  categories: { [key: string]: number };
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar: string;
  dietaryPreferences: string[];
  favoriteCuisines: string[];
  spiceTolerance?: 'mild' | 'medium' | 'hot' | 'extra-hot';
  monthlyBudget?: number;
}

// Budget ranges for filtering
export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number;
  description: string;
}

export const BUDGET_RANGES: BudgetRange[] = [
  { id: 'budget', label: '₹150 - ₹300', min: 150, max: 300, description: 'Quick bites & snacks' },
  { id: 'pocket', label: '₹300 - ₹500', min: 300, max: 500, description: 'Casual meals' },
  { id: 'moderate', label: '₹500 - ₹800', min: 500, max: 800, description: 'Good dining' },
  { id: 'premium', label: '₹800 - ₹1,500', min: 800, max: 1500, description: 'Premium experience' },
  { id: 'fine', label: '₹1,500 - ₹3,000', min: 1500, max: 3000, description: 'Fine dining' },
  { id: 'luxury', label: '₹3,000+', min: 3000, max: 10000, description: 'Luxury experience' },
];
