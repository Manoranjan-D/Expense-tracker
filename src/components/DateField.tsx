import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme/colors';
import { formatDisplayDate, toISODate } from '@/utils/dates';

// Cross-platform date input: a native HTML date picker on web, and the platform
// date picker on iOS/Android.
export function DateField({
  value,
  onChange,
}: {
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
}) {
  const [showNative, setShowNative] = useState(false);

  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      style: {
        padding: 12,
        borderRadius: radius.md,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        color: colors.text,
        fontSize: 15,
        fontFamily: 'inherit',
      },
    });
  }

  const date = parseISO(value);

  return (
    <>
      <Pressable style={styles.field} onPress={() => setShowNative(true)}>
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        <Text style={styles.text}>{formatDisplayDate(value)}</Text>
      </Pressable>
      {showNative ? (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(_event, selected) => {
            setShowNative(false);
            if (selected) onChange(toISODate(selected));
          }}
        />
      ) : null}
    </>
  );
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: 15,
    color: colors.text,
  },
});
