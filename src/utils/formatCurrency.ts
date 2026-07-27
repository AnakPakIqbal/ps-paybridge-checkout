const IDR_FORMATTER = new Intl.NumberFormat('id-ID');
const USD_FORMATTER = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCurrency(amount: number, currency = 'IDR') {
  if (currency === 'IDR') {
    return 'Rp ' + IDR_FORMATTER.format(amount);
  }
  return USD_FORMATTER.format(amount);
}
