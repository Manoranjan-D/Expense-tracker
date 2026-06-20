import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useBudgets, useDeleteBudget } from '@/api/budgets';
import { useCategories } from '@/api/categories';
import { useExpenses } from '@/api/expenses';
import { useProfile } from '@/api/profiles';
import { BudgetProgressBar } from '@/components/BudgetProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, spacing } from '@/theme/colors';
import { computeBudgetProgress } from '@/utils/budgets';
import { currentMonthRange } from '@/utils/dates';
import type { Budget } from '@/types/db';

export default function BudgetsScreen() {
  const router = useRouter();
  const range = useMemo(() => currentMonthRange(), []);
  const budgetsQ = useBudgets();
  const categoriesQ = useCategories();
  const expensesQ = useExpenses({ type: 'all', range });
  const profileQ = useProfile();
  const deleteMutation = useDeleteBudget();

  const currency = profileQ.data?.default_currency ?? 'INR';
  const progresses = useMemo(() => {
    const cats = categoriesQ.data ?? [];
    const expenses = expensesQ.data ?? [];
    return (budgetsQ.data ?? []).map((b) =>
      computeBudgetProgress(b, expenses, cats),
    );
  }, [budgetsQ.data, categoriesQ.data, expensesQ.data]);

  function confirmDelete(budget: Budget) {
    const doDelete = () => deleteMutation.mutate(budget.id);
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || window.confirm('Delete this budget?'))
        doDelete();
      return;
    }
    Alert.alert('Delete budget', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/budgets/edit')} hitSlop={8}>
              <Ionicons name="add" size={26} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {budgetsQ.isLoading ? (
        <Loading />
      ) : progresses.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No budgets yet"
          message="Set a monthly limit per category or type to track spending."
        />
      ) : (
        <FlatList
          data={progresses}
          keyExtractor={(item) => item.budget.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.barWrap}>
                <BudgetProgressBar progress={item} currency={currency} />
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/budgets/edit',
                      params: { id: item.budget.id },
                    })
                  }
                  hitSlop={8}
                  style={styles.action}
                >
                  <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                  onPress={() => confirmDelete(item.budget)}
                  hitSlop={8}
                  style={styles.action}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barWrap: { flex: 1 },
  actions: { gap: spacing.xs },
  action: { padding: spacing.xs },
});
