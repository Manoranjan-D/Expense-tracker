import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import type { TypeSplit } from '@/utils/reports';

// Personal vs Business: two totals plus a single proportional stacked bar.
export function SplitChart({
  split,
  currency = 'INR',
}: {
  split: TypeSplit;
  currency?: string;
}) {
  const total = split.total || 1;
  const personalPct = (split.personal / total) * 100;
  const businessPct = (split.business / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.totals}>
        <View style={styles.totalCard}>
          <View style={[styles.dot, { backgroundColor: colors.personal }]} />
          <Text style={styles.totalLabel}>Personal</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(split.personal, currency)}
          </Text>
        </View>
        <View style={styles.totalCard}>
          <View style={[styles.dot, { backgroundColor: colors.business }]} />
          <Text style={styles.totalLabel}>Business</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(split.business, currency)}
          </Text>
        </View>
      </View>

      <View style={styles.bar}>
        {personalPct > 0 ? (
          <View
            style={{
              width: `${personalPct}%`,
              backgroundColor: colors.personal,
            }}
          />
        ) : null}
        {businessPct > 0 ? (
          <View
            style={{
              width: `${businessPct}%`,
              backgroundColor: colors.business,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  totals: { flexDirection: 'row', gap: spacing.md },
  totalCard: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  totalLabel: { fontSize: 12, color: colors.textSecondary },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  bar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
});
