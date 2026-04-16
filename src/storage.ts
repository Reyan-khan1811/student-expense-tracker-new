import { Expense, UserSettings } from './types';
import { format } from 'date-fns';

const SETTINGS_KEY = 'finflow_settings_v2';
const EXPENSES_KEY = 'finflow_expenses_v2';
const IS_BROWSER = typeof window !== 'undefined';

export const getSettings = (): UserSettings | null => {
  if (!IS_BROWSER) return null;
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveSettings = (settings: UserSettings) => {
  if (!IS_BROWSER) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getExpenses = (): Expense[] => {
  if (!IS_BROWSER) return [];
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveExpenses = (expenses: Expense[]) => {
  if (!IS_BROWSER) return;
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

export const getExpensesForMonth = (month: string): Expense[] => {
  const all = getExpenses();
  return all.filter(e => e.date.startsWith(month));
};

export const addExpense = (expense: Expense) => {
  const all = getExpenses();
  all.push(expense);
  saveExpenses(all);
};

export const updateExpense = (expense: Expense) => {
  const all = getExpenses();
  const idx = all.findIndex(e => e.id === expense.id);
  if (idx >= 0) {
    all[idx] = expense;
    saveExpenses(all);
  }
};

export const deleteExpense = (id: string) => {
  const all = getExpenses();
  const filtered = all.filter(e => e.id !== id);
  saveExpenses(filtered);
};

export const resetMonth = (month: string) => {
  const all = getExpenses();
  const filtered = all.filter(e => !e.date.startsWith(month));
  saveExpenses(filtered);
};

export const clearAllData = () => {
  if (!IS_BROWSER) return;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(EXPENSES_KEY);
};

export function exportToCSV(expenses: Expense[], currencySymbol: string, _customCategories?: any[]): string {
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Frequency'].join(',');
  const rows = expenses.map(e => [
    e.date,
    e.categoryId,
    `"${e.description.replace(/"/g, '""')}"`,
    `${currencySymbol}${e.amount}`,
    e.frequency
  ].join(','));
  return [headers, ...rows].join('\n');
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
