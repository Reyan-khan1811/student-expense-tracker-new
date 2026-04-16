
export interface CategoryInfo {
  id: string;
  label: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export type Frequency = 'one-time' | 'weekly' | 'monthly';

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  frequency: Frequency;
  createdAt: string;
}

export interface UserSettings {
  name: string;
  monthlyBudget: number;
  currency: string;
  currencySymbol: string;
  createdAt: string;
  customCategories: CategoryInfo[];
}

export interface MonthData {
  month: string;
  expenses: Expense[];
  budget: number;
}
