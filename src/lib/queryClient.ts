import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Shared query keys so invalidation stays consistent across the app.
export const queryKeys = {
  profile: ['profile'] as const,
  categories: ['categories'] as const,
  expenses: (filters?: unknown) =>
    filters ? (['expenses', filters] as const) : (['expenses'] as const),
  budgets: ['budgets'] as const,
};
