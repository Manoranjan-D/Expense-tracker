import { Text, type TextProps, type TextStyle } from 'react-native';

import { formatCurrency } from '@/utils/currency';

export function CurrencyText({
  amount,
  currency = 'INR',
  style,
  ...rest
}: {
  amount: number;
  currency?: string;
  style?: TextStyle | TextStyle[];
} & Omit<TextProps, 'style'>) {
  return (
    <Text style={style} {...rest}>
      {formatCurrency(amount, currency)}
    </Text>
  );
}
