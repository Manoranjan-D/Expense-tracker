import type { Budget, Category, Expense } from '@/types/db';

export type BudgetLevel = 'ok' | 'warning' | 'over';

export interface BudgetProgress {
  budget: Budget;
  label: string;
  spent: number;
  limit: number;
  ratio: number; // spent / limit (can exceed 1)
  level: BudgetLevel;
}

// Does an expense count toward this budget?
function matchesBudget(budget: Budget, e: Pick<Expense, 'type' | 'category_id'>): boolean {
  if (budget.category_id && budget.category_id !== e.category_id) return false;
  if (budget.type !== 'all' && budget.type !== e.type) return false;
  return true;
}

function levelFor(ratio: number): BudgetLevel {
  if (ratio >= 1) return 'over';
  if (ratio >= 0.8) return 'warning';
  return 'ok';
}

export function computeBudgetProgress(
  budget: Budget,
  expenses: Pick<Expense, 'amount' | 'type' | 'category_id'>[],
  categories: Category[],
): BudgetProgress {
  const spent = expenses
    .filter((e) => matchesBudget(budget, e))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const limit = Number(budget.limit_amount) || 0;
  const ratio = limit > 0 ? spent / limit : 0;

  const catName = budget.category_id
    ? categories.find((c) => c.id === budget.category_id)?.name ?? 'Category'
    : null;
  const typeName =
    budget.type === 'all'
      ? 'All spending'
      : budget.type === 'business'
        ? 'Business'
        : 'Personal';
  const label = catName ? `${catName} · ${typeName}` : typeName;

  return { budget, label, spent, limit, ratio, level: levelFor(ratio) };
}
