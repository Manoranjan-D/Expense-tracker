import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useExpenses } from '@/api/expenses';
import { useProfile } from '@/api/profiles';
import { CategoryPie } from '@/components/charts/CategoryPie';
import { SplitChart } from '@/components/charts/SplitChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { DateField } from '@/components/DateField';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { RangeToggle } from '@/components/RangeToggle';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TypeToggle } from '@/components/TypeToggle';
import { useUIStore } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme/colors';
import {
  lastNMonthKeys,
  rangeForKey,
  toISODate,
} from '@/utils/dates';
import { monthlyTrend, spendByCategory, typeSplit } from '@/utils/reports';

export default function Reports() {
  const {
    typeFilter,
    setTypeFilter,
    rangeKey,
    setRangeKey,
    customRange,
    setCustomRange,
  } = useUIStore();
  const profileQ = useProfile();
  const currency = profileQ.data?.default_currency ?? 'INR';

  const range = useMemo(
    () => rangeForKey(rangeKey, customRange),
    [rangeKey, customRange],
  );

  // Selected-range data drives the pie + split.
  const rangeQ = useExpenses({ type: typeFilter, range });
  const rangeExpenses = rangeQ.data ?? [];

  // Trend always spans the last 6 months (independent of the range toggle).
  const trendRange = useMemo(() => {
    const keys = lastNMonthKeys(6);
    const start = `${keys[0]}-01`;
    return { start, end: toISODate(new Date()) };
  }, []);
  const trendQ = useExpenses({ type: typeFilter, range: trendRange });

  const slices = useMemo(
    () => spendByCategory(rangeExpenses),
    [rangeExpenses],
  );
  const split = useMemo(() => typeSplit(rangeExpenses), [rangeExpenses]);
  const trend = useMemo(
    () => monthlyTrend(trendQ.data ?? [], lastNMonthKeys(6)),
    [trendQ.data],
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
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

        {rangeQ.isLoading ? (
          <Loading />
        ) : rangeExpenses.length === 0 ? (
          <EmptyState
            icon="bar-chart-outline"
            title="Nothing to report"
            message="Add expenses in this period to see charts."
          />
        ) : (
          <>
            <Card title="Spend by category">
              <CategoryPie data={slices} currency={currency} />
            </Card>

            <Card title="Personal vs Business">
              <SplitChart split={split} currency={currency} />
            </Card>
          </>
        )}

        <Card title="Monthly trend (last 6 months)">
          {trendQ.isLoading ? (
            <Loading />
          ) : (
            <TrendChart data={trend} currency={currency} />
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  customRow: { flexDirection: 'row', gap: spacing.md },
  customField: { flex: 1, gap: spacing.xs },
  customLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
});
