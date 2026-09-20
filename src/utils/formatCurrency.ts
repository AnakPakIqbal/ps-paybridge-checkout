const IDR_FORMATTER = new Intl.NumberFormat('id-ID');
const DECIMAL_BASE = 10;
const FRACTION_DIGITS = /\.(\d+)/;

// PayBridge amounts are integers in the currency's MINOR unit (USD 1999 is $19.99), except
// IDR, which every Indonesian provider counts in whole rupiah (25000 is Rp 25.000).
// The locale data already knows how many decimals a currency has ("$0.00" -> 2,
// "¥0" -> 0), so the only currency that needs special handling here is IDR.
function minorDigits(currency: string): number {
  const zero = (0).toLocaleString('en-US', { style: 'currency', currency });
  return FRACTION_DIGITS.exec(zero)?.[1]?.length ?? 0;
}

export function formatCurrency(amount: number, currency = 'IDR') {
  if (currency === 'IDR') {
    return 'Rp ' + IDR_FORMATTER.format(amount);
  }
  try {
    const value = amount / DECIMAL_BASE ** minorDigits(currency);
    return value.toLocaleString('en-US', { style: 'currency', currency });
  } catch {
    // A malformed code should never blank the amount; show it plainly instead.
    return `${currency} ${String(amount)}`;
  }
}
