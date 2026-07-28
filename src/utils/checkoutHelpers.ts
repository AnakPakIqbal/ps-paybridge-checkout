import type {
  CardTokenDetails,
  CheckoutSession,
  PaymentMethodTabId,
  PspProvider,
} from '../types/checkout';

import { PAYMENT_METHOD_CATEGORY, PAYMENT_METHOD_TAB, PSP_PROVIDER } from '../types/checkout';
import { loadScript } from './loadScript';

export interface InitialMethodSelection {
  vaMethodCode: string | null;
  ewalletMethodCode: string | null;
  tab: PaymentMethodTabId | null;
}

export function deriveInitialMethodSelection(
  availableMethods: CheckoutSession['availableMethods'],
): InitialMethodSelection {
  if (!availableMethods) {
    return { vaMethodCode: null, ewalletMethodCode: null, tab: null };
  }

  const [firstVaMethod] = availableMethods.filter(
    (option) => option.category === PAYMENT_METHOD_CATEGORY.VIRTUAL_ACCOUNT,
  );
  const [firstWalletMethod] = availableMethods.filter(
    (option) =>
      option.category === PAYMENT_METHOD_CATEGORY.E_WALLET ||
      option.category === PAYMENT_METHOD_CATEGORY.QR_CODE,
  );

  const hasCard = availableMethods.some(
    (option) => option.category === PAYMENT_METHOD_CATEGORY.CARD,
  );
  const hasVa = availableMethods.some(
    (option) => option.category === PAYMENT_METHOD_CATEGORY.VIRTUAL_ACCOUNT,
  );
  const hasEwallet = availableMethods.some(
    (option) =>
      option.category === PAYMENT_METHOD_CATEGORY.E_WALLET ||
      option.category === PAYMENT_METHOD_CATEGORY.QR_CODE,
  );

  let tab: PaymentMethodTabId | null = null;
  if (hasVa) tab = PAYMENT_METHOD_TAB.VA;
  else if (hasEwallet) tab = PAYMENT_METHOD_TAB.EWALLET;
  else if (hasCard) tab = PAYMENT_METHOD_TAB.CARD;

  return {
    vaMethodCode: firstVaMethod?.code ?? null,
    ewalletMethodCode: firstWalletMethod?.code ?? null,
    tab,
  };
}

export async function tokenizeCard(
  provider: PspProvider,
  cardDetailsObj: CardTokenDetails,
): Promise<string | null> {
  const { number, cvv, expiryMonth, expiryYear } = cardDetailsObj;

  if (provider === PSP_PROVIDER.MIDTRANS) {
    const clientKey = window.MIDTRANS_CLIENT_KEY ?? '';
    const environment = window.MIDTRANS_ENVIRONMENT ?? 'sandbox';

    await loadScript(
      'midtrans-script',
      'https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js',
      {
        'data-environment': environment,
        'data-client-key': clientKey,
      },
    );

    const midtransSdk = window.MidtransNew3ds;
    if (!midtransSdk) {
      throw new Error('Midtrans card SDK failed to load.');
    }

    return new Promise<string>((resolve, reject) => {
      const cardData = {
        card_number: number.replace(/\s/g, ''),
        card_cvv: cvv,
        card_exp_month: expiryMonth,
        card_exp_year: expiryYear,
      };

      midtransSdk.getCardToken(cardData, {
        onSuccess: (response) => {
          if (response.token_id) {
            resolve(response.token_id);
          } else {
            reject(new Error('Card tokenization succeeded but no token ID was returned.'));
          }
        },
        onFailure: (response) => {
          reject(new Error(response.status_message ?? 'Midtrans card tokenization failed.'));
        },
      });
    });
  }
  return null;
}
