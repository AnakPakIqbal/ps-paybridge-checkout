import { loadScript } from './loadScript';

const MIDTRANS_SDK_URL = 'https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js';
const MIDTRANS_SCRIPT_ID = 'midtrans-script';

export interface CardToRegister {
  number: string;
  // Two-digit month and four-digit year, as Midtrans wants them.
  expiryMonth: string;
  expiryYear: string;
}

/**
 * Saves a card with Midtrans WITHOUT charging it and returns the reusable saved_token_id.
 *
 * Runs entirely in the browser through Midtrans's own SDK, so the card number goes straight
 * to Midtrans and never to PayBridge. (Not a fetch(): Midtrans answers /v2/card/register with
 * no CORS headers, so a cross-origin fetch could never read the reply -- the SDK uses JSONP.)
 * No CVV is asked for or sent: registering does not need one, and a security code that is
 * never used should never be collected.
 */
export async function registerMidtransCard(card: CardToRegister): Promise<string> {
  await loadScript(MIDTRANS_SCRIPT_ID, MIDTRANS_SDK_URL, {
    'data-environment': window.MIDTRANS_ENVIRONMENT ?? 'sandbox',
    'data-client-key': window.MIDTRANS_CLIENT_KEY ?? '',
  });

  const sdk = window.MidtransNew3ds;
  if (!sdk) throw new Error('Midtrans card SDK failed to load.');

  return new Promise<string>((resolve, reject) => {
    sdk.registerCard(
      {
        card_number: card.number.replace(/\s/g, ''),
        card_exp_month: card.expiryMonth,
        card_exp_year: card.expiryYear,
      },
      {
        onSuccess: (response) => {
          if (response.saved_token_id) {
            resolve(response.saved_token_id);
          } else {
            reject(new Error('The card was accepted but no token was returned.'));
          }
        },
        onFailure: (response) => {
          reject(new Error(response.status_message ?? 'This card could not be saved.'));
        },
      },
    );
  });
}
