import { StyleSheet, Text, View } from 'react-native';

import { CurrencyText } from '@/components/CurrencyText';
import { colors, radius, spacing } from '@/theme/colors';
import type { BudgetProgress } from '@/utils/budgets';

const LEVEL_COLOR = {
  ok: colors.primary,
  warning: colors.warning,
  over: colors.danger,
} as const;

export function BudgetProgressBar({
  progress,
  currency = 'INR',
}: {
  progress: BudgetProgress;
  currency?: string;
}) {
  const color = LEVEL_COLOR[progress.level];
  const pct = Math.min(progress.ratio, 1) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>
          {progress.label}
        </Text>
        <Text style={styles.amounts}>
          <CurrencyText amount={progress.spent} currency={currency} /> /{' '}
          <CurrencyText amount={progress.limit} currency={currency} />
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]}
        />
      </View>
      <Text style={[styles.pct, { color }]}>
        {Math.round(progress.ratio * 100)}% used
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  amounts: { fontSize: 12, color: colors.textSecondary },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.full },
  pct: { fontSize: 11, fontWeight: '600' },
});
