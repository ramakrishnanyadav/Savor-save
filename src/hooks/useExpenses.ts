import { useState, useCallback } from 'react';
import { Expense } from '@/types';
import { mockExpenses } from '@/data/mockData';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);

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

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalSpent,
    getSpendingByCategory,
    getSpendingByCuisine,
    getRecentExpenses,
  };
}
