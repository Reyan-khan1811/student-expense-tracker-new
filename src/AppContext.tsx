import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Expense, UserSettings, CategoryInfo } from './types';
import * as storage from './storage';
import { generateId } from './storage';

interface AppState {
  settings: UserSettings | null;
  currentMonth: string;
  expenses: Expense[];
  isOnboarded: boolean;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error';
}

interface AppContextValue extends AppState {
  saveUserSettings: (settings: UserSettings) => void;
  addNewExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  editExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  setCurrentMonth: (month: string) => void;
  resetCurrentMonth: () => void;
  clearAll: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  refreshData: () => void;
  addCustomCategory: (category: CategoryInfo) => void;
  removeCustomCategory: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const settings = storage.getSettings();
    const currentMonth = storage.getCurrentMonth();
    const expenses = storage.getExpensesForMonth(currentMonth);
    return {
      settings,
      currentMonth,
      expenses,
      isOnboarded: !!settings,
      toasts: [],
    };
  });

  const refreshData = useCallback(() => {
    const expenses = storage.getExpensesForMonth(state.currentMonth);
    setState(prev => ({ ...prev, expenses }));
  }, [state.currentMonth]);

  const saveUserSettings = useCallback((settings: UserSettings) => {
    storage.saveSettings(settings);
    setState(prev => ({ ...prev, settings, isOnboarded: true }));
  }, []);

  const addNewExpense = useCallback((expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    storage.addExpense(expense);
    const expenses = storage.getExpensesForMonth(state.currentMonth);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = state.settings?.monthlyBudget || 0;

    setState(prev => {
      const newToasts = [...prev.toasts];
      const toastId = generateId();
      newToasts.push({ id: toastId, message: 'Expense added! ✅', type: 'success' });

      if (totalSpent > budget && budget > 0) {
        const warningId = generateId();
        newToasts.push({ id: warningId, message: "⚠️ You've exceeded your budget!", type: 'warning' });
      }

      return { ...prev, expenses, toasts: newToasts };
    });
  }, [state.currentMonth, state.settings]);

  const editExpense = useCallback((expense: Expense) => {
    storage.updateExpense(expense);
    const expenses = storage.getExpensesForMonth(state.currentMonth);
    setState(prev => ({ ...prev, expenses }));
  }, [state.currentMonth]);

  const removeExpense = useCallback((id: string) => {
    storage.deleteExpense(id);
    const expenses = storage.getExpensesForMonth(state.currentMonth);
    setState(prev => ({ ...prev, expenses }));
  }, [state.currentMonth]);

  const setCurrentMonth = useCallback((month: string) => {
    const expenses = storage.getExpensesForMonth(month);
    setState(prev => ({ ...prev, currentMonth: month, expenses }));
  }, []);

  const resetCurrentMonth = useCallback(() => {
    storage.resetMonth(state.currentMonth);
    setState(prev => ({ ...prev, expenses: [] }));
  }, [state.currentMonth]);

  const clearAll = useCallback(() => {
    storage.clearAllData();
    setState({
      settings: null,
      currentMonth: storage.getCurrentMonth(),
      expenses: [],
      isOnboarded: false,
      toasts: [],
    });
  }, []);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, { id, message, type }],
    }));
  }, []);

  const removeToast = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(t => t.id !== id),
    }));
  }, []);

  // Auto-remove toasts after 3 seconds
  useEffect(() => {
    if (state.toasts.length === 0) return;
    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        toasts: prev.toasts.slice(1),
      }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [state.toasts]);

  const addCustomCategory = useCallback((cat: CategoryInfo) => {
    if (!state.settings) return;
    const newSettings: UserSettings = {
      ...state.settings,
      customCategories: [...(state.settings.customCategories || []), { ...cat, isCustom: true }]
    };
    saveUserSettings(newSettings);
  }, [state.settings, saveUserSettings]);

  const removeCustomCategory = useCallback((id: string) => {
    if (!state.settings) return;
    const newSettings: UserSettings = {
      ...state.settings,
      customCategories: (state.settings.customCategories || []).filter(c => c.id !== id)
    };
    saveUserSettings(newSettings);
  }, [state.settings, saveUserSettings]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        saveUserSettings,
        addNewExpense,
        editExpense,
        removeExpense,
        setCurrentMonth,
        resetCurrentMonth,
        clearAll,
        addToast,
        removeToast,
        refreshData,
        addCustomCategory,
        removeCustomCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
