import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme/colors';

type Level = 'warning' | 'danger';

export function AlertBanner({
  level,
  message,
  onDismiss,
}: {
  level: Level;
  message: string;
  onDismiss?: () => void;
}) {
  const palette =
    level === 'danger'
      ? { bg: '#FEECEC', fg: colors.danger, icon: 'alert-circle' as const }
      : { bg: '#FEF6E7', fg: colors.warning, icon: 'warning' as const };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Ionicons name={palette.icon} size={18} color={palette.fg} />
      <Text style={[styles.message, { color: palette.fg }]}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={16} color={palette.fg} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  message: { flex: 1, fontSize: 13, fontWeight: '600' },
});
