import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { ExpenseInput, ExpenseWithCategory } from '@/types/db';
import type { TypeFilter } from '@/store/uiStore';
import type { DateRange } from '@/utils/dates';

export interface ExpenseFilters {
  type: TypeFilter;
  range: DateRange;
}

const SELECT = '*, category:categories(*)';

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async (): Promise<ExpenseWithCategory[]> => {
      let query = supabase
        .from('expenses')
        .select(SELECT)
        .gte('expense_date', filters.range.start)
        .lte('expense_date', filters.range.end)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.type !== 'all') query = query.eq('type', filters.type);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ExpenseWithCategory[];
    },
  });
}

export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: ['expense', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<ExpenseWithCategory> => {
      const { data, error } = await supabase
        .from('expenses')
        .select(SELECT)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ExpenseWithCategory;
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ExpenseInput) => {
      const user_id = await currentUserId();
      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...input, user_id })
        .select(SELECT)
        .single();
      if (error) throw error;
      return data as ExpenseWithCategory;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ExpenseInput>;
    }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(input)
        .eq('id', id)
        .select(SELECT)
        .single();
      if (error) throw error;
      return data as ExpenseWithCategory;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense', vars.id] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
