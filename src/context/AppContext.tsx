import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Expense, Restaurant, UserProfile } from '@/types';
import { mockExpenses, mockRestaurants, mockUser } from '@/data/mockData';

interface AppContextType {
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getTotalSpent: () => number;
  getSpendingByCategory: () => Record<string, number>;
  getSpendingByCuisine: () => Record<string, number>;
  getRecentExpenses: (limit?: number) => Expense[];

  // User Profile
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;

  // Restaurants
  restaurants: Restaurant[];

  // Budget
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  budgetRemaining: number;
  budgetPercentage: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    ...mockUser,
    avatar: '', // Don't use mockUser avatar, will load from DB
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    spiceTolerance: 'medium',
    monthlyBudget: 15000,
  });
  const [favorites, setFavorites] = useState<string[]>(['1', '4']);
  const [restaurants] = useState<Restaurant[]>(mockRestaurants);
  const [monthlyBudget, setMonthlyBudget] = useState(15000);

  // Load profile from database on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.log('ℹ️ No profile found in database, using defaults');
            return;
          }

          if (data) {
            console.log('✅ Profile loaded from database:', data);
            setUserProfile(prev => ({
              ...prev,
              name: data.name || prev.name,
              avatar: data.avatar ?? '', // Use ?? to handle null/undefined, but keep empty string
              phone: data.phone || prev.phone,
              bio: prev.bio, // bio is not in profiles table
            }));
          }
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  // Expense functions
  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const getTotalSpent = useCallback(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const getSpendingByCategory = useCallback(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const getSpendingByCuisine = useCallback(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.cuisine] = (acc[expense.cuisine] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const getRecentExpenses = useCallback((limit: number = 5) => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [expenses]);

  // Profile functions
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    
    // Save to Supabase database
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const updateData: any = {
          user_id: user.id,
          updated_at: new Date().toISOString(),
        };
        
        // Only include fields that exist in the profiles table
        if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        
        const { error } = await supabase
          .from('profiles')
          .upsert(updateData, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('❌ Error saving profile:', error);
          console.error('Error details:', error);
        } else {
          console.log('✅ Profile saved to database', updateData);
        }
      }
    } catch (error) {
      console.error('❌ Error updating profile in database:', error);
    }
  }, []);

  // Favorites functions
  const toggleFavorite = useCallback((restaurantId: string) => {
    setFavorites(prev => 
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  }, []);

  const isFavorite = useCallback((restaurantId: string) => {
    return favorites.includes(restaurantId);
  }, [favorites]);

  // Budget calculations
  const totalSpent = getTotalSpent();
  const budgetRemaining = monthlyBudget - totalSpent;
  const budgetPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const value: AppContextType = {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalSpent,
    getSpendingByCategory,
    getSpendingByCuisine,
    getRecentExpenses,
    userProfile,
    updateProfile,
    favorites,
    toggleFavorite,
    isFavorite,
    restaurants,
    monthlyBudget,
    setMonthlyBudget,
    budgetRemaining,
    budgetPercentage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
