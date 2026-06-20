import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { env } from '@/lib/env';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, spacing } from '@/theme/colors';

export default function Login() {
  const { session, loading, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session && !loading) return <Redirect href="/(tabs)/dashboard" />;

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
    setBusy(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={40} color={colors.white} />
        </View>
        <Text style={styles.title}>Expense Tracker</Text>
        <Text style={styles.subtitle}>
          Track personal & business spending, scan receipts, and stay on budget.
        </Text>

        {!env.isConfigured ? (
          <View style={styles.notice}>
            <Ionicons name="information-circle" size={18} color={colors.info} />
            <Text style={styles.noticeText}>
              Supabase isn&apos;t configured. Add EXPO_PUBLIC_SUPABASE_URL and
              EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env, then restart.
            </Text>
          </View>
        ) : (
          <Button
            label="Continue with Google"
            icon="logo-google"
            onPress={handleSignIn}
            loading={busy}
            style={styles.button}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: { width: '100%' },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.textSecondary },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
});
