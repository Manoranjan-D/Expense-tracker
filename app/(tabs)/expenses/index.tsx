import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useExpenses } from '@/api/expenses';
import { useProfile } from '@/api/profiles';
import { CurrencyText } from '@/components/CurrencyText';
import { DateField } from '@/components/DateField';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseListItem } from '@/components/ExpenseListItem';
import { Loading } from '@/components/Loading';
import { RangeToggle } from '@/components/RangeToggle';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TypeToggle } from '@/components/TypeToggle';
import { useUIStore } from '@/store/uiStore';
import { colors, spacing } from '@/theme/colors';
import { rangeForKey } from '@/utils/dates';
import { typeSplit } from '@/utils/reports';

export default function ExpensesScreen() {
  const router = useRouter();
  const {
    typeFilter,
    setTypeFilter,
    rangeKey,
    setRangeKey,
    customRange,
    setCustomRange,
  } = useUIStore();

  const range = useMemo(
    () => rangeForKey(rangeKey, customRange),
    [rangeKey, customRange],
  );
  const expensesQ = useExpenses({ type: typeFilter, range });
  const profileQ = useProfile();
  const currency = profileQ.data?.default_currency ?? 'INR';

  const expenses = expensesQ.data ?? [];
  const split = useMemo(() => typeSplit(expenses), [expenses]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TypeToggle value={typeFilter} onChange={setTypeFilter} includeAll />
        <RangeToggle value={rangeKey} onChange={setRangeKey} />
        {rangeKey === 'custom' ? (
          <View style={styles.customRow}>
            <View style={styles.customField}>
              <Text style={styles.customLabel}>From</Text>
              <DateField
                value={customRange.start}
                onChange={(start) => setCustomRange({ ...customRange, start })}
              />
            </View>
            <View style={styles.customField}>
              <Text style={styles.customLabel}>To</Text>
              <DateField
                value={customRange.end}
                onChange={(end) => setCustomRange({ ...customRange, end })}
              />
            </View>
          </View>
        ) : null}

        {/* Totals */}
        <View style={styles.totals}>
          <Total label="Total" value={split.total} currency={currency} />
          <Total label="Personal" value={split.personal} currency={currency} />
          <Total label="Business" value={split.business} currency={currency} />
        </View>
      </View>

      {expensesQ.isLoading ? (
        <Loading />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No expenses found"
          message="Try a different filter, or add a new expense with the + button."
        />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ExpenseListItem
              expense={item}
              onPress={() => router.push(`/(tabs)/expenses/${item.id}`)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

function Total({
  label,
  value,
  currency,
}: {
  label: string;
  value: number;
  currency: string;
}) {
  return (
    <View style={styles.totalItem}>
      <Text style={styles.totalLabel}>{label}</Text>
      <CurrencyText amount={value} currency={currency} style={styles.totalValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, gap: spacing.md },
  customRow: { flexDirection: 'row', gap: spacing.md },
  customField: { flex: 1, gap: spacing.xs },
  customLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  totals: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  totalItem: { flex: 1, gap: 2 },
  totalLabel: { fontSize: 12, color: colors.textSecondary },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.sm },
});
