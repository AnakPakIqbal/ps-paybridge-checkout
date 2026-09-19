import { useEffect } from 'react';

import type { CheckoutSession, PaymentMethodTabId } from '../types/checkout';

import { resolveCheckoutSession, selectCheckoutMethod } from '../services/checkoutApi';
import {
  CARD_PAYMENT_METHOD_CODE,
  PAYMENT_METHOD_TAB,
  PSP_PROVIDER,
  SESSION_STATUS,
} from '../types/checkout';

// Mirrors useXenditCheckout.ts's shape exactly -- Stripe's Payment Element, like Xendit's
// Components, needs its session (here: a PaymentIntent) created upfront before it can
// render, so card-tab selection is auto-triggered the same way, and resolving after
// confirmation follows the identical request/response shape (both endpoints share
// POST /checkout/{id}/resolve-session -- see checkout.service.ts resolveSession).
export interface StripeCheckoutDeps {
  sessionId: string | null;
  token: string | null;
  session: CheckoutSession | null;
  method: PaymentMethodTabId;
  hasUserSelectedMethod: boolean;
  overrideSelection: boolean;
  submitting: boolean;
  setSession: (session: CheckoutSession) => void;
  setToken: (token: string) => void;
  setOverrideSelection: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setFormError: (message: string | null) => void;
  subscribeToSSE: (sessionId: string, token: string) => void;
}

export function useStripeCheckout({
  sessionId,
  token,
  session,
  method,
  hasUserSelectedMethod,
  overrideSelection,
  submitting,
  setSession,
  setToken,
  setOverrideSelection,
  setSubmitting,
  setFormError,
  subscribeToSSE,
}: Readonly<StripeCheckoutDeps>) {
  const selectPaymentMethod = async (methodCode: string) => {
    if (!sessionId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const updatedSess = await selectCheckoutMethod(sessionId, token ?? '', methodCode);
      setSession(updatedSess);
      if (updatedSess.checkoutToken) {
        setToken(updatedSess.checkoutToken);
      }
      if (updatedSess.status === SESSION_STATUS.AWAITING_PAYMENT) {
        subscribeToSSE(sessionId, updatedSess.checkoutToken ?? token ?? '');
      }
      setOverrideSelection(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to select payment method.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      hasUserSelectedMethod &&
      (session?.status === SESSION_STATUS.AWAITING_METHOD_SELECTION || overrideSelection) &&
      method === PAYMENT_METHOD_TAB.CARD &&
      session?.provider === PSP_PROVIDER.STRIPE &&
      !submitting
    ) {
      void selectPaymentMethod(CARD_PAYMENT_METHOD_CODE.STRIPE_CARD);
    }
    // Deliberately narrow: only re-run when the tab/session status/provider actually
    // change — selectPaymentMethod and submitting are not stable/relevant trigger deps here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, session?.status, session?.provider, hasUserSelectedMethod, overrideSelection]);

  const resolveStripeSession = async () => {
    const paymentIntentId = session?.paymentAttempt?.providerChargeId;
    if (!sessionId || !paymentIntentId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const resolvedSession = await resolveCheckoutSession(sessionId, token ?? '', paymentIntentId);
      setSession(resolvedSession);
      if (resolvedSession.checkoutToken) {
        setToken(resolvedSession.checkoutToken);
      }
      if (resolvedSession.status === SESSION_STATUS.AWAITING_PAYMENT) {
        subscribeToSSE(sessionId, resolvedSession.checkoutToken ?? token ?? '');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to resolve card payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return { selectPaymentMethod, resolveStripeSession };
}
