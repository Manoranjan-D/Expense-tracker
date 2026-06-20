import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useBudgets } from '@/api/budgets';
import { useCategories } from '@/api/categories';
import { useExpenses } from '@/api/expenses';
import { useProfile } from '@/api/profiles';
import { AlertBanner } from '@/components/AlertBanner';
import { BudgetProgressBar } from '@/components/BudgetProgressBar';
import { CurrencyText } from '@/components/CurrencyText';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseListItem } from '@/components/ExpenseListItem';
import { Loading } from '@/components/Loading';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useUIStore } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme/colors';
import { computeBudgetProgress } from '@/utils/budgets';
import { currentMonthRange } from '@/utils/dates';
import { typeSplit } from '@/utils/reports';

export default function Dashboard() {
  const router = useRouter();
  const range = useMemo(() => currentMonthRange(), []);
  const expensesQ = useExpenses({ type: 'all', range });
  const budgetsQ = useBudgets();
  const categoriesQ = useCategories();
  const profileQ = useProfile();
  const { dismissedBanners, dismissBanner } = useUIStore();

  const currency = profileQ.data?.default_currency ?? 'INR';
  const expenses = expensesQ.data ?? [];
  const split = useMemo(() => typeSplit(expenses), [expenses]);

  const progresses = useMemo(() => {
    const cats = categoriesQ.data ?? [];
    return (budgetsQ.data ?? []).map((b) =>
      computeBudgetProgress(b, expenses, cats),
    );
  }, [budgetsQ.data, categoriesQ.data, expenses]);

  const alerts = progresses.filter(
    (p) => p.level !== 'ok' && !dismissedBanners[p.budget.id],
  );

  if (expensesQ.isLoading) return <Loading label="Loading dashboard…" />;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Budget alerts */}
        {alerts.map((p) => (
          <AlertBanner
            key={p.budget.id}
            level={p.level === 'over' ? 'danger' : 'warning'}
            message={
              p.level === 'over'
                ? `Over budget on ${p.label} (${Math.round(p.ratio * 100)}%)`
                : `Nearing budget on ${p.label} (${Math.round(p.ratio * 100)}%)`
            }
            onDismiss={() => dismissBanner(p.budget.id)}
          />
        ))}

        {/* This month summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Spent this month</Text>
          <CurrencyText
            amount={split.total}
            currency={currency}
            style={styles.summaryTotal}
          />
          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: colors.personal }]} />
              <Text style={styles.splitLabel}>Personal</Text>
              <CurrencyText
                amount={split.personal}
                currency={currency}
                style={styles.splitValue}
              />
            </View>
            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: colors.business }]} />
              <Text style={styles.splitLabel}>Business</Text>
              <CurrencyText
                amount={split.business}
                currency={currency}
                style={styles.splitValue}
              />
            </View>
          </View>
        </View>

        {/* Budgets */}
        <SectionHeader
          title="Budgets"
          actionLabel="Manage"
          onAction={() => router.push('/budgets')}
        />
        {progresses.length === 0 ? (
          <Pressable
            style={styles.emptyInline}
            onPress={() => router.push('/budgets')}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.emptyInlineText}>Set a monthly budget</Text>
          </Pressable>
        ) : (
          <View style={styles.budgetList}>
            {progresses.map((p) => (
              <BudgetProgressBar
                key={p.budget.id}
                progress={p}
                currency={currency}
              />
            ))}
          </View>
        )}

        {/* Recent */}
        <SectionHeader
          title="Recent expenses"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/expenses')}
        />
        {expenses.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No expenses yet"
            message="Tap the + button to add your first expense."
          />
        ) : (
          <View style={styles.expenseList}>
            {expenses.slice(0, 5).map((e) => (
              <ExpenseListItem
                key={e.id}
                expense={e}
                onPress={() => router.push(`/(tabs)/expenses/${e.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  summaryCard: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  summaryLabel: { color: colors.surfaceAlt, fontSize: 14 },
  summaryTotal: { color: colors.white, fontSize: 34, fontWeight: '800' },
  splitRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  splitItem: { flex: 1, gap: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  splitLabel: { color: colors.surfaceAlt, fontSize: 12 },
  splitValue: { color: colors.white, fontSize: 16, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionAction: { fontSize: 14, fontWeight: '600', color: colors.primary },
  budgetList: { gap: spacing.sm },
  expenseList: { gap: spacing.sm },
  emptyInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  emptyInlineText: { color: colors.primary, fontWeight: '600' },
});
