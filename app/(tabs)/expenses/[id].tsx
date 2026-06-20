import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, View } from 'react-native';

import { useCategories } from '@/api/categories';
import {
  useDeleteExpense,
  useExpense,
  useUpdateExpense,
} from '@/api/expenses';
import { useProfile } from '@/api/profiles';
import { getReceiptSignedUrl } from '@/api/receipts';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Loading } from '@/components/Loading';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, radius, spacing } from '@/theme/colors';
import type { ExpenseInput } from '@/types/db';

export default function EditExpense() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const expenseQ = useExpense(id);
  const categoriesQ = useCategories();
  const profileQ = useProfile();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const currency = profileQ.data?.default_currency ?? 'INR';
  const expense = expenseQ.data;

  useEffect(() => {
    if (expense?.receipt_url) {
      getReceiptSignedUrl(expense.receipt_url).then(setReceiptUrl);
    }
  }, [expense?.receipt_url]);

  if (expenseQ.isLoading || categoriesQ.isLoading) return <Loading />;
  if (!expense) {
    return (
      <ScreenContainer>
        <EmptyState title="Expense not found" icon="alert-circle-outline" />
      </ScreenContainer>
    );
  }

  function handleUpdate(values: ExpenseInput) {
    updateMutation.mutate(
      { id: expense!.id, input: values },
      { onSuccess: () => router.back() },
    );
  }

  function confirmDelete() {
    const doDelete = () =>
      deleteMutation.mutate(expense!.id, { onSuccess: () => router.back() });

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || window.confirm('Delete this expense?'))
        doDelete();
      return;
    }
    Alert.alert('Delete expense', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  }

  return (
    <ScreenContainer>
      {receiptUrl ? (
        <View style={styles.receiptPreview}>
          <Text style={styles.receiptLabel}>Receipt</Text>
          <Image source={{ uri: receiptUrl }} style={styles.receiptImage} />
        </View>
      ) : null}
      <ExpenseForm
        categories={categoriesQ.data ?? []}
        currency={currency}
        submitLabel="Save changes"
        submitting={updateMutation.isPending}
        onSubmit={handleUpdate}
        onDelete={confirmDelete}
        initial={{
          amount: expense.amount,
          currency: expense.currency,
          expense_date: expense.expense_date,
          category_id: expense.category_id,
          type: expense.type,
          merchant: expense.merchant,
          notes: expense.notes,
          payment_method: expense.payment_method,
          receipt_url: expense.receipt_url,
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  receiptPreview: { padding: spacing.lg, paddingBottom: 0, gap: spacing.xs },
  receiptLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  receiptImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
});
