// Date helpers for filtering / reporting. Dates are stored as ISO 'YYYY-MM-DD'.

export type RangeKey = 'this_month' | 'last_month' | 'custom';

export interface DateRange {
  start: string; // inclusive YYYY-MM-DD
  end: string; // inclusive YYYY-MM-DD
}

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function monthRange(d: Date): DateRange {
  return { start: toISODate(startOfMonth(d)), end: toISODate(endOfMonth(d)) };
}

export function currentMonthRange(): DateRange {
  return monthRange(new Date());
}

export function lastMonthRange(): DateRange {
  const now = new Date();
  return monthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));
}

export function rangeForKey(key: RangeKey, custom?: DateRange): DateRange {
  switch (key) {
    case 'this_month':
      return currentMonthRange();
    case 'last_month':
      return lastMonthRange();
    case 'custom':
      return custom ?? currentMonthRange();
  }
}

// Returns the YYYY-MM key for grouping (e.g. monthly trend).
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

// Human label for a month key like '2026-06' -> 'Jun 2026'.
export function monthKeyLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, (month ?? 1) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Last N month keys ending with the current month (oldest first).
export function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(toISODate(d).slice(0, 7));
  }
  return keys;
}

export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, (month ?? 1) - 1, day ?? 1);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
