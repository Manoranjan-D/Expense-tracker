import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { DateField } from '@/components/DateField';
import { Field, TextField } from '@/components/Field';
import { TypeToggle } from '@/components/TypeToggle';
import {
  parseReceipt,
  pickReceiptImage,
  uploadReceipt,
} from '@/api/receipts';
import { colors, radius, spacing } from '@/theme/colors';
import type { Category, ExpenseInput, ExpenseType } from '@/types/db';
import { parseAmount } from '@/utils/currency';
import { toISODate } from '@/utils/dates';

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank', 'Other'];

export interface ExpenseFormValues {
  amount: number;
  currency: string;
  expense_date: string;
  category_id: string | null;
  type: ExpenseType;
  merchant: string | null;
  notes: string | null;
  payment_method: string | null;
  receipt_url: string | null;
}

export function ExpenseForm({
  categories,
  initial,
  submitting,
  submitLabel = 'Save expense',
  onSubmit,
  onDelete,
  currency = 'INR',
}: {
  categories: Category[];
  initial?: Partial<ExpenseFormValues>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ExpenseInput) => void;
  onDelete?: () => void;
  currency?: string;
}) {
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : '',
  );
  const [expenseDate, setExpenseDate] = useState(
    initial?.expense_date ?? toISODate(new Date()),
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    initial?.category_id ?? categories[0]?.id ?? null,
  );
  const [type, setType] = useState<ExpenseType>(initial?.type ?? 'personal');
  const [merchant, setMerchant] = useState(initial?.merchant ?? '');
  const [paymentMethod, setPaymentMethod] = useState(
    initial?.payment_method ?? '',
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [receiptPath, setReceiptPath] = useState<string | null>(
    initial?.receipt_url ?? null,
  );
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddReceipt(source: 'camera' | 'library') {
    setError(null);
    try {
      const image = await pickReceiptImage(source);
      if (!image) return;
      setPreviewUri(image.uri);
      setScanning(true);

      const path = await uploadReceipt(image);
      setReceiptPath(path);

      // OCR pre-fill — best effort; failures don't block manual entry.
      try {
        const parsed = await parseReceipt(path);
        if (parsed.amount != null) setAmount(String(parsed.amount));
        if (parsed.expense_date) setExpenseDate(parsed.expense_date);
        if (parsed.merchant) setMerchant(parsed.merchant);
      } catch {
        notify('Receipt uploaded, but OCR could not read it. Please fill in manually.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add receipt.');
    } finally {
      setScanning(false);
    }
  }

  function chooseReceiptSource() {
    if (Platform.OS === 'web') {
      void handleAddReceipt('library');
      return;
    }
    Alert.alert('Add receipt', 'Capture or choose a receipt image', [
      { text: 'Camera', onPress: () => void handleAddReceipt('camera') },
      { text: 'Photo Library', onPress: () => void handleAddReceipt('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleSubmit() {
    setError(null);
    const numericAmount = parseAmount(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }
    if (!categoryId) {
      setError('Pick a category.');
      return;
    }
    onSubmit({
      amount: numericAmount,
      currency,
      expense_date: expenseDate,
      category_id: categoryId,
      type,
      merchant: merchant.trim() || null,
      notes: notes.trim() || null,
      payment_method: paymentMethod.trim() || null,
      receipt_url: receiptPath,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Receipt scan */}
      <Pressable style={styles.receiptCard} onPress={chooseReceiptSource}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.receiptThumb} />
        ) : (
          <View style={styles.receiptIcon}>
            <Ionicons name="scan-outline" size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.receiptText}>
          <Text style={styles.receiptTitle}>
            {receiptPath ? 'Receipt attached' : 'Scan a receipt'}
          </Text>
          <Text style={styles.receiptSubtitle}>
            {scanning
              ? 'Reading receipt…'
              : 'Auto-fill amount, date & merchant'}
          </Text>
        </View>
        {scanning ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        )}
      </Pressable>

      <TextField
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />

      <Field label="Type">
        <TypeToggle value={type} onChange={(v) => setType(v as ExpenseType)} />
      </Field>

      <Field label="Date">
        <DateField value={expenseDate} onChange={setExpenseDate} />
      </Field>

      <Field label="Category">
        <CategoryPicker
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
        />
      </Field>

      <TextField
        label="Merchant"
        value={merchant}
        onChangeText={setMerchant}
        placeholder="e.g. Big Bazaar"
      />

      <Field label="Payment method">
        <View style={styles.chipRow}>
          {PAYMENT_METHODS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setPaymentMethod(m)}
              style={[
                styles.payChip,
                paymentMethod === m && styles.payChipActive,
              ]}
            >
              <Text
                style={[
                  styles.payChipText,
                  paymentMethod === m && styles.payChipTextActive,
                ]}
              >
                {m}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>

      <Field label="Notes">
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes"
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.notes}
        />
      </Field>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={submitLabel}
        onPress={handleSubmit}
        loading={submitting}
        icon="checkmark"
      />

      {onDelete ? (
        <Button
          label="Delete expense"
          variant="danger"
          icon="trash-outline"
          onPress={onDelete}
          style={styles.deleteBtn}
        />
      ) : null}
    </ScrollView>
  );
}

function notify(message: string) {
  if (Platform.OS === 'web') {
    // Avoid a hard dependency on window.alert in non-DOM contexts.
    if (typeof window !== 'undefined') window.alert(message);
  } else {
    Alert.alert('Receipt', message);
  }
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  receiptIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptThumb: { width: 48, height: 48, borderRadius: radius.md },
  receiptText: { flex: 1 },
  receiptTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  receiptSubtitle: { fontSize: 12, color: colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  payChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  payChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  payChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  payChipTextActive: { color: colors.primary },
  notes: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  deleteBtn: { marginTop: spacing.xs },
});
