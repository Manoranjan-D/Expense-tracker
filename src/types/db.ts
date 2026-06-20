// Type definitions mirroring the Supabase / Postgres schema in
// supabase/migrations/0001_init.sql. Kept hand-written (rather than generated)
// so the app has no build-time dependency on the Supabase CLI.

export type ExpenseType = 'personal' | 'business';
export type BudgetType = 'personal' | 'business' | 'all';
export type BudgetPeriod = 'monthly';

export interface Profile {
  id: string; // FK -> auth.users.id
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string; // e.g. 'INR'
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string; // @expo/vector-icons (Ionicons) name
  color: string; // hex
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  expense_date: string; // ISO date (YYYY-MM-DD)
  category_id: string | null;
  type: ExpenseType;
  merchant: string | null;
  notes: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

// Expense joined with its category (used in lists/reports).
export interface ExpenseWithCategory extends Expense {
  category: Category | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  type: BudgetType;
  period: BudgetPeriod;
  limit_amount: number;
  created_at: string;
}

// Payloads for inserts/updates (server fills id / timestamps / user_id).
export type ExpenseInput = Omit<
  Expense,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type CategoryInput = Omit<
  Category,
  'id' | 'user_id' | 'created_at' | 'is_default'
> & { is_default?: boolean };
export type BudgetInput = Omit<Budget, 'id' | 'user_id' | 'created_at'>;
