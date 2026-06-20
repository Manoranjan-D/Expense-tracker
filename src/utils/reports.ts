import { chartPalette } from '@/theme/colors';
import type { Category, ExpenseWithCategory } from '@/types/db';
import { monthKey, monthKeyLabel } from '@/utils/dates';

export interface CategorySlice {
  name: string;
  color: string;
  total: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TypeSplit {
  personal: number;
  business: number;
  total: number;
}

export function spendByCategory(
  expenses: ExpenseWithCategory[],
): CategorySlice[] {
  const map = new Map<string, CategorySlice>();
  expenses.forEach((e, i) => {
    const name = e.category?.name ?? 'Uncategorised';
    const color = e.category?.color ?? chartPalette[i % chartPalette.length];
    const existing = map.get(name);
    if (existing) existing.total += Number(e.amount);
    else map.set(name, { name, color, total: Number(e.amount) });
  });
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function monthlyTrend(
  expenses: ExpenseWithCategory[],
  monthKeys: string[],
): TrendPoint[] {
  const totals = new Map<string, number>();
  monthKeys.forEach((k) => totals.set(k, 0));
  expenses.forEach((e) => {
    const k = monthKey(e.expense_date);
    if (totals.has(k)) totals.set(k, (totals.get(k) ?? 0) + Number(e.amount));
  });
  return monthKeys.map((k) => ({
    label: monthKeyLabel(k).split(' ')[0], // short month
    value: totals.get(k) ?? 0,
  }));
}

export function typeSplit(expenses: ExpenseWithCategory[]): TypeSplit {
  let personal = 0;
  let business = 0;
  expenses.forEach((e) => {
    if (e.type === 'business') business += Number(e.amount);
    else personal += Number(e.amount);
  });
  return { personal, business, total: personal + business };
}

export function total(expenses: ExpenseWithCategory[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

// Keep categories param for callers that want a fixed color mapping.
export function categoryColor(
  name: string,
  categories: Category[],
  fallbackIndex = 0,
): string {
  return (
    categories.find((c) => c.name === name)?.color ??
    chartPalette[fallbackIndex % chartPalette.length]
  );
}
