import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
} from '@/api/budgets';
import { useCategories } from '@/api/categories';
import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { Field, TextField } from '@/components/Field';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, radius, spacing } from '@/theme/colors';
import type { BudgetType } from '@/types/db';
import { parseAmount } from '@/utils/currency';

const TYPES: { value: BudgetType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
];

export default function BudgetEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const budgetsQ = useBudgets();
  const categoriesQ = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();

  const existing = budgetsQ.data?.find((b) => b.id === id);
  const [type, setType] = useState<BudgetType>(existing?.type ?? 'all');
  const [categoryId, setCategoryId] = useState<string | null>(
    existing?.category_id ?? null,
  );
  const [limit, setLimit] = useState(
    existing?.limit_amount != null ? String(existing.limit_amount) : '',
  );
  const [error, setError] = useState<string | null>(null);

  const saving = createMutation.isPending || updateMutation.isPending;

  function handleSave() {
    const limitAmount = parseAmount(limit);
    if (!limitAmount || limitAmount <= 0) {
      setError('Enter a limit greater than 0.');
      return;
    }
    const input = {
      type,
      category_id: categoryId,
      period: 'monthly' as const,
      limit_amount: limitAmount,
    };
    if (id && existing) {
      updateMutation.mutate({ id, input }, { onSuccess: () => router.back() });
    } else {
      createMutation.mutate(input, { onSuccess: () => router.back() });
    }
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Field label="Applies to">
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                style={[styles.typeChip, type === t.value && styles.typeChipActive]}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === t.value && styles.typeTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Category (optional)">
          <View style={styles.categoryRow}>
            <Pressable
              onPress={() => setCategoryId(null)}
              style={[styles.allChip, !categoryId && styles.allChipActive]}
            >
              <Text style={[styles.typeText, !categoryId && styles.typeTextActive]}>
                Any category
              </Text>
            </Pressable>
          </View>
          <CategoryPicker
            categories={categoriesQ.data ?? []}
            value={categoryId}
            onChange={setCategoryId}
          />
        </Field>

        <TextField
          label="Monthly limit"
          value={limit}
          onChangeText={setLimit}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={id ? 'Save changes' : 'Add budget'}
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
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  typeText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  typeTextActive: { color: colors.primary },
  categoryRow: { flexDirection: 'row', marginBottom: spacing.sm },
  allChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  allChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
