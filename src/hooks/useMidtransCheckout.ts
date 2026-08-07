import type { CardTokenDetails, CheckoutSession } from '../types/checkout';

import { selectCheckoutMethod, submitCardToken } from '../services/checkoutApi';
import { CARD_PAYMENT_METHOD_CODE, PSP_PROVIDER, SESSION_STATUS } from '../types/checkout';
import { tokenizeCard } from '../utils/checkoutHelpers';

declare global {
  interface Window {
    MIDTRANS_CLIENT_KEY?: string;
    MIDTRANS_ENVIRONMENT?: 'sandbox' | 'production';
    MidtransNew3ds?: {
      getCardToken: (
        cardData: Record<string, string>,
        callbacks: {
          onSuccess: (response: { token_id?: string }) => void;
          onFailure: (response: { status_message?: string }) => void;
        },
      ) => void;
    };
  }
}

export interface MidtransCheckoutDeps {
  sessionId: string | null;
  token: string | null;
  session: CheckoutSession | null;
  setSession: (session: CheckoutSession) => void;
  setToken: (token: string) => void;
  setOverrideSelection: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setFormError: (message: string | null) => void;
  subscribeToSSE: (sessionId: string, token: string) => void;
}

export function useMidtransCheckout({
  sessionId,
  token,
  session,
  setSession,
  setToken,
  setOverrideSelection,
  setSubmitting,
  setFormError,
  subscribeToSSE,
}: Readonly<MidtransCheckoutDeps>) {
  const submitCardPayment = async (cardDetailsObj: CardTokenDetails) => {
    if (!session || !sessionId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const cardMethod =
        session.provider === PSP_PROVIDER.MIDTRANS
          ? CARD_PAYMENT_METHOD_CODE.MIDTRANS_CREDIT_CARD
          : CARD_PAYMENT_METHOD_CODE.XENDIT_CARDS;
      const selSession = await selectCheckoutMethod(sessionId, token ?? '', cardMethod);
      const currentToken = selSession.checkoutToken ?? token ?? '';
      setSession(selSession);
      setToken(currentToken);
      setOverrideSelection(false);

      let cardTokenBody: Record<string, unknown>;
      if (session.provider === PSP_PROVIDER.XENDIT) {
        cardTokenBody = {
          cardDetails: {
            cardNumber: cardDetailsObj.number.replace(/\s/g, ''),
            expiryMonth: cardDetailsObj.expiryMonth,
            expiryYear: cardDetailsObj.expiryYear,
            cvn: cardDetailsObj.cvv,
            cardholderFirstName: cardDetailsObj.firstName,
            cardholderLastName: cardDetailsObj.lastName,
          },
        };
      } else {
        const pspToken = await tokenizeCard(session.provider, cardDetailsObj);
        cardTokenBody = { token: pspToken };
      }

      const tokenSession = await submitCardToken(sessionId, currentToken, cardTokenBody);
      setSession(tokenSession);
      if (tokenSession.checkoutToken) {
        setToken(tokenSession.checkoutToken);
      }

      const checkoutUrl = tokenSession.paymentAttempt?.checkoutUrl;
      if (checkoutUrl?.startsWith('http')) {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      }

      if (tokenSession.status === SESSION_STATUS.AWAITING_PAYMENT) {
        subscribeToSSE(sessionId, tokenSession.checkoutToken ?? currentToken);
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to complete credit card transaction.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { submitCardPayment };
}
