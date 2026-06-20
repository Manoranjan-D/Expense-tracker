import { useRouter } from 'expo-router';

import { useCategories } from '@/api/categories';
import { useCreateExpense } from '@/api/expenses';
import { useProfile } from '@/api/profiles';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Loading } from '@/components/Loading';
import { ScreenContainer } from '@/components/ScreenContainer';
import type { ExpenseInput } from '@/types/db';

export default function AddExpense() {
  const router = useRouter();
  const categoriesQ = useCategories();
  const profileQ = useProfile();
  const createMutation = useCreateExpense();

  const currency = profileQ.data?.default_currency ?? 'INR';

  if (categoriesQ.isLoading) return <Loading />;
  if ((categoriesQ.data ?? []).length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="albums-outline"
          title="No categories yet"
          message="Add a category in Settings before creating an expense."
        />
      </ScreenContainer>
    );
  }

  function handleCreate(values: ExpenseInput) {
    createMutation.mutate(values, {
      onSuccess: () => router.replace('/(tabs)/expenses'),
    });
  }

  return (
    <ScreenContainer>
      <ExpenseForm
        categories={categoriesQ.data ?? []}
        currency={currency}
        submitLabel="Add expense"
        submitting={createMutation.isPending}
        onSubmit={handleCreate}
      />
    </ScreenContainer>
  );
}
