import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/api/categories';
import { Button } from '@/components/Button';
import { Field, TextField } from '@/components/Field';
import { ScreenContainer } from '@/components/ScreenContainer';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/presets';
import { colors, radius, spacing } from '@/theme/colors';

export default function CategoryEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const categoriesQ = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const existing = categoriesQ.data?.find((c) => c.id === id);
  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? CATEGORY_ICONS[0]);
  const [color, setColor] = useState(existing?.color ?? CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const saving = createMutation.isPending || updateMutation.isPending;

  function handleSave() {
    if (!name.trim()) {
      setError('Enter a category name.');
      return;
    }
    const input = { name: name.trim(), icon, color };
    if (id && existing) {
      updateMutation.mutate(
        { id, input },
        { onSuccess: () => router.back() },
      );
    } else {
      createMutation.mutate(input, { onSuccess: () => router.back() });
    }
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: color }]}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={colors.white}
            />
          </View>
          <Text style={styles.previewName}>{name || 'New category'}</Text>
        </View>

        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Groceries"
        />

        <Field label="Icon">
          <View style={styles.grid}>
            {CATEGORY_ICONS.map((ic) => (
              <Pressable
                key={ic}
                onPress={() => setIcon(ic)}
                style={[styles.iconCell, icon === ic && styles.iconCellActive]}
              >
                <Ionicons
                  name={ic}
                  size={22}
                  color={icon === ic ? colors.primary : colors.textSecondary}
                />
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Color">
          <View style={styles.grid}>
            {CATEGORY_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorCell,
                  { backgroundColor: c },
                  color === c && styles.colorCellActive,
                ]}
              />
            ))}
          </View>
        </Field>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={id ? 'Save changes' : 'Add category'}
          icon="checkmark"
          loading={saving}
          onPress={handleSave}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  preview: { alignItems: 'center', gap: spacing.sm },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { fontSize: 16, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCellActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  colorCell: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorCellActive: { borderColor: colors.text },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
