import { useState, useCallback, useMemo } from 'react';
import { Budget } from '@/types';
import { mockBudget } from '@/data/mockData';

export function useBudget(totalSpent: number) {
  const [budget, setBudget] = useState<Budget>({
    ...mockBudget,
    spent: totalSpent,
  });

  const budgetRemaining = useMemo(() => {
    return budget.monthly - totalSpent;
  }, [budget.monthly, totalSpent]);

  const budgetPercentage = useMemo(() => {
    return Math.min((totalSpent / budget.monthly) * 100, 100);
  }, [budget.monthly, totalSpent]);

  const budgetStatus = useMemo(() => {
    const percentage = budgetPercentage;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'healthy';
  }, [budgetPercentage]);

  const updateMonthlyBudget = useCallback((amount: number) => {
    setBudget(prev => ({ ...prev, monthly: amount }));
  }, []);

  const updateCategoryBudget = useCallback((category: string, amount: number) => {
    setBudget(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: amount },
    }));
  }, []);

  return {
    budget,
    budgetRemaining,
    budgetPercentage,
    budgetStatus,
    updateMonthlyBudget,
    updateCategoryBudget,
  };
}
