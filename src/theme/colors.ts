// Eco / sustainable light theme — teal-green accent on bright backgrounds.

export const colors = {
  // Brand
  primary: '#0E9F6E', // teal-green
  primaryDark: '#0B7E58',
  primaryLight: '#34D399',
  accent: '#14B8A6',

  // Backgrounds
  background: '#F2FBF7', // very light mint
  surface: '#FFFFFF',
  surfaceAlt: '#E9F7F0',

  // Text
  text: '#0F291F',
  textSecondary: '#5B7066',
  textMuted: '#90A29A',

  // Borders / lines
  border: '#DCEDE5',
  divider: '#EAF4EF',

  // Semantic
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',

  // Type tags
  personal: '#14B8A6',
  business: '#6366F1',

  // Misc
  white: '#FFFFFF',
  black: '#0F291F',
  shadow: '#0F291F',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '500' as const },
} as const;

// Default chart palette (category colors fall back to these).
export const chartPalette = [
  '#0E9F6E',
  '#14B8A6',
  '#F59E0B',
  '#6366F1',
  '#EF4444',
  '#0EA5E9',
  '#A855F7',
  '#EC4899',
  '#84CC16',
  '#F97316',
];

// Max content width for the centered web layout.
export const WEB_MAX_WIDTH = 760;
