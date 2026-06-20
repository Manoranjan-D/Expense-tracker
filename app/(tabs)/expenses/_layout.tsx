import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

export default function ExpensesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Expenses' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit expense' }} />
    </Stack>
  );
}
