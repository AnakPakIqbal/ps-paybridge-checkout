const IDR_FORMATTER = new Intl.NumberFormat('id-ID');

export function formatCurrency(amount: number, currency = 'IDR') {
  if (currency === 'IDR') {
    return 'Rp ' + IDR_FORMATTER.format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
