// Live-formatting for the card fields the app draws itself (Midtrans -- Stripe and Xendit
// render their own inputs). Shared by the checkout card form and the subscription one.

const CARD_NUMBER_DIGITS = 16;
const CARD_NUMBER_GROUP = 4;
const EXPIRY_DIGITS = 4;
const EXPIRY_MONTH_DIGITS = 2;

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, CARD_NUMBER_DIGITS);
  return digits.replace(new RegExp(`(.{${CARD_NUMBER_GROUP}})`, 'g'), '$1 ').trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, EXPIRY_DIGITS);
  if (digits.length > EXPIRY_MONTH_DIGITS) {
    return `${digits.slice(0, EXPIRY_MONTH_DIGITS)}/${digits.slice(EXPIRY_MONTH_DIGITS)}`;
  }
  return digits;
}
