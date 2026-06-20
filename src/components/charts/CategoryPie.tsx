import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { colors, spacing } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import type { CategorySlice } from '@/utils/reports';

export function CategoryPie({
  data,
  currency = 'INR',
}: {
  data: CategorySlice[];
  currency?: string;
}) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const pieData = data.map((d) => ({
    value: d.total,
    color: d.color,
    text: '',
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={58}
          innerCircleColor={colors.surface}
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={styles.centerLabel}>Total</Text>
              <Text style={styles.centerValue}>
                {formatCurrency(total, currency)}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.name} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={styles.legendName} numberOfLines={1}>
              {d.name}
            </Text>
            <Text style={styles.legendValue}>
              {formatCurrency(d.total, currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  chartWrap: { alignItems: 'center' },
  center: { alignItems: 'center' },
  centerLabel: { fontSize: 12, color: colors.textSecondary },
  centerValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  legend: { gap: spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { flex: 1, fontSize: 14, color: colors.text },
  legendValue: { fontSize: 14, fontWeight: '600', color: colors.text },
});
