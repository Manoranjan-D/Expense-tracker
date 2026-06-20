import { Ionicons } from '@expo/vector-icons';

import { chartPalette } from '@/theme/colors';

// Icon choices for custom categories (Ionicons names).
export const CATEGORY_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'fast-food-outline',
  'car-outline',
  'briefcase-outline',
  'flash-outline',
  'cart-outline',
  'medkit-outline',
  'film-outline',
  'home-outline',
  'airplane-outline',
  'cafe-outline',
  'gift-outline',
  'school-outline',
  'fitness-outline',
  'phone-portrait-outline',
  'paw-outline',
  'pricetag-outline',
];

export const CATEGORY_COLORS = chartPalette;
