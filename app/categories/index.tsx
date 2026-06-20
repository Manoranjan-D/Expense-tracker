import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCategories, useDeleteCategory } from '@/api/categories';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, radius, spacing } from '@/theme/colors';
import type { Category } from '@/types/db';

export default function CategoriesScreen() {
  const router = useRouter();
  const categoriesQ = useCategories();
  const deleteMutation = useDeleteCategory();

  function confirmDelete(cat: Category) {
    const doDelete = () => deleteMutation.mutate(cat.id);
    const msg = `Delete "${cat.name}"? Expenses keep their record but lose this category.`;
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || window.confirm(msg)) doDelete();
      return;
    }
    Alert.alert('Delete category', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/categories/edit')}
              hitSlop={8}
            >
              <Ionicons name="add" size={26} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {categoriesQ.isLoading ? (
        <Loading />
      ) : (categoriesQ.data ?? []).length === 0 ? (
        <EmptyState
          icon="albums-outline"
          title="No categories"
          message="Add a category to start organising expenses."
        />
      ) : (
        <FlatList
          data={categoriesQ.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
                <Ionicons
                  name={(item.icon as keyof typeof Ionicons.glyphMap) ?? 'pricetag-outline'}
                  size={18}
                  color={colors.white}
                />
              </View>
              <Text style={styles.name}>{item.name}</Text>
              {item.is_default ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Default</Text>
                </View>
              ) : null}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/categories/edit',
                    params: { id: item.id },
                  })
                }
                hitSlop={8}
                style={styles.action}
              >
                <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
              </Pressable>
              {!item.is_default ? (
                <Pressable
                  onPress={() => confirmDelete(item)}
                  hitSlop={8}
                  style={styles.action}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.sm },
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
  },
  badgeText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  action: { padding: spacing.xs },
});
