export type CardBrand = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'generic';

export function getCardBrand(num: string): CardBrand {
  const clean = (num || '').replace(/\s/g, '');
  if (clean.startsWith('4')) return 'visa';
  if (clean.startsWith('5') || clean.startsWith('2')) return 'mastercard';
  if (clean.startsWith('35')) return 'jcb';
  if (clean.startsWith('34') || clean.startsWith('37')) return 'amex';
  return 'generic';
}
