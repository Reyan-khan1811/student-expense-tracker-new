import type { CategoryInfo } from './types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'food-canteen', label: 'Food & Canteen', icon: '🍕', color: '#f97316' },
  { id: 'transport', label: 'Transport', icon: '🚌', color: '#3b82f6' },
  { id: 'stationery-academics', label: 'Stationery & Academics', icon: '📚', color: '#8b5cf6' },
  { id: 'subscriptions-entertainment', label: 'OTT & Subscriptions', icon: '🎬', color: '#ec4899' },
  { id: 'social-outings', label: 'Social & Outings', icon: '🎉', color: '#14b8a6' },
  { id: 'others', label: 'Miscellaneous', icon: '📦', color: '#64748b' },
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: '₹ INR' },
  { code: 'USD', symbol: '$', label: '$ USD' },
  { code: 'EUR', symbol: '€', label: '€ EUR' },
  { code: 'GBP', symbol: '£', label: '£ GBP' },
];

export function getCategoryInfo(id: string, customList: CategoryInfo[] = []): CategoryInfo {
  const all = [...DEFAULT_CATEGORIES, ...customList];
  return all.find(c => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}
