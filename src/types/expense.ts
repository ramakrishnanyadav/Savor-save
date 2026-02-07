// Expense Tracker Types

export type ExpenseStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type TransactionType = 'income' | 'expense' | 'split';
export type SplitMethod = 'equal' | 'manual';

export interface SplitShare {
  person: number;
  amount: number;
  name?: string;
}

export interface FoodExpense {
  id: string;
  foodId?: string;
  foodName: string;
  restaurant?: string;
  category: 'dine-in' | 'delivery' | 'takeout' | 'home-cooked' | 'street-food';
  amount: number;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  cuisine?: string;
  notes?: string;
  image?: string;
  // New fields
  status: ExpenseStatus;
  transactionType: TransactionType;
  isSplit: boolean;
  splitTotal?: number;
  splitPeople?: number;
  splitMethod?: SplitMethod;
  splitShares?: SplitShare[];
  cancelledAt?: Date;
  cancelledReason?: string;
}

export interface DailyExpenseSummary {
  date: string;
  total: number;
  meals: number;
  expenses: FoodExpense[];
}

export interface WeeklyExpenseSummary {
  weekStart: string;
  weekEnd: string;
  total: number;
  averagePerDay: number;
  byCategory: Record<string, number>;
  byCuisine: Record<string, number>;
  byMealType: Record<string, number>;
}

export interface MonthlyExpenseSummary {
  month: string;
  total: number;
  budget: number;
  remaining: number;
  percentUsed: number;
  byWeek: { week: number; total: number }[];
  topCuisines: { name: string; amount: number }[];
  topRestaurants: { name: string; amount: number }[];
}

export interface ExpenseBudget {
  monthly: number;
  weekly: number;
  daily: number;
  alertThreshold: number; // Percentage (default 80)
  enableAlerts: boolean;
  budgetPeriod: 'daily' | 'weekly' | 'monthly';
}

export interface BudgetUsage {
  totalSpent: number;
  budgetLimit: number;
  percentageUsed: number;
  remaining: number;
  alertThreshold: number;
  shouldAlert: boolean;
}

export interface ExpenseStats {
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  cancelledCount: number;
  totalExpenses: number;
  totalIncome: number;
  totalSplitExpenses: number;
  splitCount: number;
}
