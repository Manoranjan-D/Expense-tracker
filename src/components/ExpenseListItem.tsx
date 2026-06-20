import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CurrencyText } from '@/components/CurrencyText';
import { colors, radius, spacing } from '@/theme/colors';
import type { ExpenseWithCategory } from '@/types/db';
import { formatDisplayDate } from '@/utils/dates';

export function ExpenseListItem({
  expense,
  onPress,
}: {
  expense: ExpenseWithCategory;
  onPress: () => void;
}) {
  const cat = expense.category;
  const color = cat?.color ?? colors.primary;
  const icon = (cat?.icon as keyof typeof Ionicons.glyphMap) ?? 'pricetag-outline';
  const typeColor =
    expense.type === 'business' ? colors.business : colors.personal;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color={colors.white} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {expense.merchant || cat?.name || 'Expense'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatDisplayDate(expense.expense_date)}</Text>
          <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
          <Text style={[styles.meta, { color: typeColor }]}>
            {expense.type === 'business' ? 'Business' : 'Personal'}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <CurrencyText
          amount={expense.amount}
          currency={expense.currency}
          style={styles.amount}
        />
        {expense.receipt_url ? (
          <Ionicons name="receipt-outline" size={14} color={colors.textMuted} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { fontSize: 12, color: colors.textSecondary },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  right: { alignItems: 'flex-end', gap: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: colors.text },
});
