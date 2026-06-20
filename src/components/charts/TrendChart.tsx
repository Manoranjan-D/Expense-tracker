import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { colors, spacing } from '@/theme/colors';
import { currencySymbol } from '@/utils/currency';
import type { TrendPoint } from '@/utils/reports';

export function TrendChart({
  data,
  currency = 'INR',
}: {
  data: TrendPoint[];
  currency?: string;
}) {
  const barData = data.map((d) => ({
    value: Math.round(d.value),
    label: d.label,
    frontColor: colors.primary,
  }));
  const max = Math.max(1, ...barData.map((d) => d.value));

  return (
    <View style={styles.container}>
      <BarChart
        data={barData}
        barWidth={22}
        barBorderRadius={6}
        frontColor={colors.primary}
        noOfSections={4}
        maxValue={Math.ceil(max * 1.2)}
        yAxisThickness={0}
        xAxisThickness={0}
        spacing={18}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        yAxisLabelPrefix={currencySymbol(currency)}
        isAnimated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.sm },
});
