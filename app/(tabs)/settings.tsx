import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useProfile } from '@/api/profiles';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, spacing } from '@/theme/colors';

export default function Settings() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const profileQ = useProfile();
  const profile = profileQ.data;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.white} />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>
              {profile?.full_name ?? user?.user_metadata?.full_name ?? 'You'}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Default currency</Text>
          <Text style={styles.rowValue}>
            {profile?.default_currency ?? 'INR'}
          </Text>
        </View>

        {/* Management links */}
        <View style={styles.group}>
          <LinkRow
            icon="albums-outline"
            label="Categories"
            onPress={() => router.push('/categories')}
          />
          <LinkRow
            icon="wallet-outline"
            label="Budgets"
            onPress={() => router.push('/budgets')}
          />
        </View>

        <Button
          label="Sign out"
          variant="secondary"
          icon="log-out-outline"
          onPress={signOut}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.linkLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLabel: { fontSize: 15, color: colors.text },
  rowValue: { fontSize: 15, fontWeight: '600', color: colors.primary },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  linkLabel: { flex: 1, fontSize: 15, color: colors.text },
});
