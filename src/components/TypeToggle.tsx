import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme/colors';
import type { ExpenseType } from '@/types/db';
import type { TypeFilter } from '@/store/uiStore';

interface Option {
  value: TypeFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// includeAll renders the segmented control used for filtering (All/Personal/
// Business). Without it, it's the Personal/Business toggle used on the form.
export function TypeToggle({
  value,
  onChange,
  includeAll = false,
}: {
  value: TypeFilter;
  onChange: (v: TypeFilter) => void;
  includeAll?: boolean;
}) {
  const options: Option[] = [
    ...(includeAll
      ? [{ value: 'all' as const, label: 'All', icon: 'apps-outline' as const }]
      : []),
    { value: 'personal', label: 'Personal', icon: 'person-outline' },
    { value: 'business', label: 'Business', icon: 'briefcase-outline' },
  ];

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt.value === value;
        const activeColor =
          opt.value === 'business' ? colors.business : colors.personal;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              active && {
                backgroundColor: colors.surface,
                borderColor:
                  opt.value === 'all' ? colors.primary : activeColor,
              },
            ]}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={active ? colors.text : colors.textSecondary}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Exposed for callers that only deal with the strict expense type.
export type { ExpenseType };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.text,
  },
});
