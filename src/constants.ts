export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  AED: 'د.إ',
  CAD: 'C$',
  AUD: 'A$',
  SGD: 'S$',
};

export const formatCurrency = (amount: number, currency: string = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
};
