import { create } from 'zustand';

import type { ExpenseType } from '@/types/db';
import type { DateRange, RangeKey } from '@/utils/dates';
import { currentMonthRange } from '@/utils/dates';

// 'all' is a UI-only filter value (not a DB enum value).
export type TypeFilter = 'all' | ExpenseType;

interface UIState {
  // Expenses list + reports filtering
  typeFilter: TypeFilter;
  setTypeFilter: (t: TypeFilter) => void;

  rangeKey: RangeKey;
  customRange: DateRange;
  setRangeKey: (k: RangeKey) => void;
  setCustomRange: (r: DateRange) => void;

  // Dismissed budget banners (by budget id) so alerts don't nag repeatedly.
  dismissedBanners: Record<string, boolean>;
  dismissBanner: (id: string) => void;
  resetBanners: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  typeFilter: 'all',
  setTypeFilter: (typeFilter) => set({ typeFilter }),

  rangeKey: 'this_month',
  customRange: currentMonthRange(),
  setRangeKey: (rangeKey) => set({ rangeKey }),
  setCustomRange: (customRange) => set({ customRange }),

  dismissedBanners: {},
  dismissBanner: (id) =>
    set((s) => ({ dismissedBanners: { ...s.dismissedBanners, [id]: true } })),
  resetBanners: () => set({ dismissedBanners: {} }),
}));
