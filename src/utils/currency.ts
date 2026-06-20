// Currency formatting. INR (₹) is the default; the value is always stored with
// its own `currency` code so other currencies (e.g. AED) can be added later.

const CURRENCY_LOCALE: Record<string, string> = {
  INR: 'en-IN',
  AED: 'ar-AE',
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
};

export function formatCurrency(amount: number, currency = 'INR'): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'en-IN';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  } catch {
    // Fallback if the runtime lacks full Intl currency data.
    const symbol = currency === 'INR' ? '₹' : `${currency} `;
    return `${symbol}${(amount ?? 0).toFixed(2)}`;
  }
}

export function currencySymbol(currency = 'INR'): string {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'AED':
      return 'د.إ';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return currency;
  }
}

// Parse a free-text amount string ("1,234.50", "₹99") into a number.
export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}
