import gsap from 'gsap';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type {
  CardTokenDetails,
  CheckoutSession,
  PaymentMethodTabId,
  PspProvider,
} from '../types/checkout';

import { icons } from '../atoms/icons';
import StatusIcon from '../atoms/StatusIcon';
import { isCardFormComplete, useCardForm } from '../hooks/useCardForm';
import SecureNotice from '../molecules/SecureNotice';
import CardForm from '../organisms/CardForm';
import EwalletForm from '../organisms/EwalletForm';
import OrderSummaryPanel from '../organisms/OrderSummaryPanel';
import PaymentFooter from '../organisms/PaymentFooter';
import PaymentMethodTabs from '../organisms/PaymentMethodTabs';
import VirtualAccountForm from '../organisms/VirtualAccountForm';
import XenditCardComponent from '../organisms/XenditCardComponent';
import {
  fetchCheckoutSession,
  openCheckoutEventStream,
  resolveCheckoutSession,
  selectCheckoutMethod,
  submitCardToken,
} from '../services/checkoutApi';
import CheckoutTemplate from '../templates/CheckoutTemplate';
import {
  CARD_PAYMENT_METHOD_CODE,
  PAYMENT_METHOD_CATEGORY,
  PAYMENT_METHOD_TAB,
  PAYMENT_ATTEMPT_STATUS,
  PSP_PROVIDER,
  SESSION_STATUS,
  VA_PROTOCOL_PREFIX,
} from '../types/checkout';
import { formatCurrency } from '../utils/formatCurrency';
import { loadScript } from '../utils/loadScript';

const PROCESSING_LABEL = 'Processing...';

declare global {
  interface Window {
    MIDTRANS_CLIENT_KEY?: string;
    // Set server-side from our own NODE_ENV — not sniffed from the client key's string
    // prefix, since some Midtrans accounts issue sandbox keys without an "SB-Mid-"
    // prefix (confirmed against this project's Midtrans dashboard).
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

interface InitialMethodSelection {
  vaMethodCode: string | null;
  ewalletMethodCode: string | null;
  tab: PaymentMethodTabId | null;
}

// Derives which VA/e-wallet method (if any) should be pre-selected, and which
// tab to land on, from a session's available payment methods.
function deriveInitialMethodSelection(
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

// Tokenize card and complete card charge flow. Returns the PSP token string,
// or null when the provider (Xendit) needs raw card details instead of a token.
// Module scope: closes over no component state, only its own params/imports.
async function tokenizeCard(
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
  // Xendit V3 uses Full PAN: raw card details go to the backend
  // which sends them directly to Xendit's /v3/payment_requests.
  // No client-side tokenization SDK is needed.
  return null;
}

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-5 bg-lineSoft rounded w-1/3 mb-2" />
      <div className="h-32 bg-lineSoft rounded-xl2 w-full mb-2" />
      <div className="space-y-4">
        <div className="h-12 bg-lineSoft rounded-xl w-full" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-lineSoft rounded-xl" />
          <div className="h-12 bg-lineSoft rounded-xl" />
        </div>
        <div className="h-12 bg-lineSoft rounded-xl w-full" />
      </div>
      <div className="h-14 bg-lineSoft rounded-xl w-full mt-4" />
    </div>
  );
}

interface ErrorBannerProps {
  message: string | null;
  onClose?: () => void;
}

function PaidView({ session }: Readonly<{ session: CheckoutSession }>) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-brandDim/80 border border-brand/35 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand/10">
        <StatusIcon variant="success" />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">Payment Successful</h2>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        Thank you! Your payment has been processed successfully. You can now close this tab safely.
      </p>
      <div className="w-full bg-panel2 border border-lineSoft rounded-xl p-4 text-left text-xs text-muted space-y-2 mb-2">
        <div className="flex justify-between">
          <span>Order Ref:</span>
          <span className="font-mono text-text">{session.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Paid:</span>
          <span className="text-brand font-semibold">
            {formatCurrency(session.amount, session.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FailedView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/5">
        <StatusIcon variant="failed" />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">Payment Failed</h2>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        This payment attempt was unsuccessful. Please return to the merchant application and try
        again.
      </p>
    </div>
  );
}

function ExpiredView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/5">
        <StatusIcon variant="expired" />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">Payment Expired</h2>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        This checkout session has expired. Please contact the merchant to request a new session.
      </p>
    </div>
  );
}

function ErrorBanner({ message, onClose }: Readonly<ErrorBannerProps>) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-xs mb-4">
      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
      <div className="flex-1">
        <p className="font-semibold mb-0.5">Payment Error</p>
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-red-400 hover:text-red-200 text-xs font-semibold self-start"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  // sessionId/token never render directly (only read inside handlers/effects as call
  // args), so react-doctor flags them as re-render waste and suggests refs instead.
  // Converting to refs here would require re-auditing every read site (~15 across the
  // fetch/SSE/submit flows below) for stale-closure correctness in payment-critical
  // code — not worth the risk for a re-render optimization. See the similar tradeoff
  // noted on renderRightSide's cognitive-complexity suppression below.
  // eslint-disable-next-line react-doctor/rerender-state-only-in-handlers
  const [sessionId, setSessionId] = useState<string | null>(null);
  // eslint-disable-next-line react-doctor/rerender-state-only-in-handlers
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [overrideSelection, setOverrideSelection] = useState(false);

  // Card input custom hook state
  const { details: cardDetails, updateField: updateCardField } = useCardForm();
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const handleCardFieldChange: typeof updateCardField = (field, value) => {
    setReviewConfirmed(false);
    updateCardField(field, value);
  };

  // VA & Ewallet selection states
  const [selectedVaMethod, setSelectedVaMethod] = useState('');
  const [selectedEwalletMethod, setSelectedEwalletMethod] = useState('');

  const [method, setMethod] = useState<PaymentMethodTabId>(PAYMENT_METHOD_TAB.CARD);
  // Distinguishes an explicit tab click from the initial default/derived tab — the
  // Xendit Components auto-session-create effect below must only fire once the
  // customer has actually chosen Card, not just because it happens to be the
  // starting tab (that was locking every Xendit session onto Card immediately,
  // hiding the VA/E-Wallet tabs before the customer could pick them).
  const [hasUserSelectedMethod, setHasUserSelectedMethod] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Parse path and query params on mount
  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const checkoutSessionId = segments[segments.length - 1];

    const hash = window.location.hash;
    const tokenMatch = /token=([^&]+)/.exec(hash);
    const initialToken = tokenMatch ? tokenMatch[1] : null;

    if (!checkoutSessionId) {
      setError('Checkout session ID is missing from the URL path.');
      setLoading(false);
      return;
    }
    if (!initialToken) {
      setError('Authorization token is missing from the URL fragment.');
      setLoading(false);
      return;
    }

    setSessionId(checkoutSessionId);
    setToken(initialToken);
    void fetchSession(checkoutSessionId, initialToken);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
    // fetchSession is a stable function recreated per render but intentionally
    // only invoked once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gsap animations
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    );
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      );
    }
  }, [method, session?.status]);

  // Fetch session details from backend
  const fetchSession = async (sid: string, tkn: string) => {
    try {
      const sess = await fetchCheckoutSession(sid, tkn);
      setSession(sess);

      if (sess.checkoutToken) {
        setToken(sess.checkoutToken);
      }

      // Initialize selected methods if available
      const initialSelection = deriveInitialMethodSelection(sess.availableMethods);
      if (initialSelection.vaMethodCode) setSelectedVaMethod(initialSelection.vaMethodCode);
      if (initialSelection.ewalletMethodCode) {
        setSelectedEwalletMethod(initialSelection.ewalletMethodCode);
      }
      if (initialSelection.tab) setMethod(initialSelection.tab);

      if (sess.status === SESSION_STATUS.AWAITING_PAYMENT) {
        subscribeToSSE(sid, sess.checkoutToken ?? tkn);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve checkout session.');
      setLoading(false);
    }
  };

  // Subscribe to real-time events via Server-Sent Events
  const subscribeToSSE = (sid: string, tkn: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const eventSource = openCheckoutEventStream(sid, tkn);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as CheckoutSession;
        setSession((prev) => (prev ? { ...prev, ...data } : data));
        if (data.checkoutToken) {
          setToken(data.checkoutToken);
        }
      } catch (parseError) {
        console.error('Error parsing SSE event data', parseError);
      }
    };

    eventSource.onerror = () => {
      console.warn('SSE connection closed or lost. Retrying...');
    };
  };

  // Submit standard non-card payment method selection
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

  // Xendit's card flow uses Components (embedded fields), not our custom CardForm — it
  // needs a Payment Session created up front to get the components_sdk_key. Auto-trigger
  // that once the customer has explicitly chosen the Card tab (hasUserSelectedMethod),
  // rather than waiting for a form submit (there is no form to submit for this path).
  // Must NOT fire just because Card happens to be the starting tab — that locked every
  // Xendit session onto Card immediately on load, before the customer could pick
  // VA/E-Wallet instead.
  useEffect(() => {
    if (
      hasUserSelectedMethod &&
      (session?.status === SESSION_STATUS.AWAITING_METHOD_SELECTION || overrideSelection) &&
      method === PAYMENT_METHOD_TAB.CARD &&
      session?.provider === PSP_PROVIDER.XENDIT &&
      !submitting
    ) {
      void selectPaymentMethod(CARD_PAYMENT_METHOD_CODE.XENDIT_CARDS);
    }
    // Deliberately narrow: only re-run when the tab/session status/provider actually
    // change — selectPaymentMethod and submitting are not stable/relevant trigger deps here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, session?.status, session?.provider, hasUserSelectedMethod, overrideSelection]);

  // Validates the card form and, if valid, submits it via submitCardPayment.
  // Shared by both the "awaiting_token" resubmit flow and the initial method-selection flow.
  // Submits whichever method tab is currently active in the method-selection picker.
  const submitSelectedMethod = () => {
    if (submitting) return;

    if (method === PAYMENT_METHOD_TAB.CARD) {
      validateAndSubmitCard();
      return;
    }

    if (method === PAYMENT_METHOD_TAB.VA) {
      if (!selectedVaMethod) {
        setFormError('Please select a bank virtual account option.');
        return;
      }
      void selectPaymentMethod(selectedVaMethod);
      return;
    }

    if (!selectedEwalletMethod) {
      setFormError('Please select an e-wallet / QRIS option.');
      return;
    }
    void selectPaymentMethod(selectedEwalletMethod);
  };

  const validateAndSubmitCard = () => {
    if (submitting) return;
    if (
      !cardDetails.number ||
      !cardDetails.firstName ||
      !cardDetails.lastName ||
      !cardDetails.expiry ||
      !cardDetails.cvv
    ) {
      setFormError('Please fill in all credit card details.');
      return;
    }
    const [expiryMonthPart, expiryYearPart] = cardDetails.expiry.split('/');
    void submitCardPayment({
      number: cardDetails.number,
      cvv: cardDetails.cvv,
      expiryMonth: expiryMonthPart?.trim() ?? '',
      expiryYear: expiryYearPart ? '20' + expiryYearPart.trim() : '',
      firstName: cardDetails.firstName,
      lastName: cardDetails.lastName,
    });
  };

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

      // Build the card-token request body based on provider:
      // - Midtrans: client-side tokenization returns a PSP token string
      // - Xendit V3: send raw card details (Full PAN flow, no client-side SDK)
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

      // Handle 3DS redirect (REQUIRES_ACTION from Xendit)
      const checkoutUrl = tokenSession.paymentAttempt?.checkoutUrl;
      if (checkoutUrl?.startsWith('http')) {
        window.location.href = checkoutUrl;
        return;
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

  // Called when Xendit's Components SDK fires `session-complete` client-side — the card
  // was tokenized/charged directly with Xendit, so we resolve the final outcome from our
  // backend (which itself queries Xendit) rather than knowing it locally.
  const resolveXenditSession = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const resolvedSession = await resolveCheckoutSession(sessionId, token ?? '');
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

  // Cognitive complexity here is inherent to the payment-status branching (awaiting-payment
  // and method-selection views), which closes over ~10 pieces of component state/callbacks.
  // Splitting those branches into standalone components would require threading that state
  // through many props, risking a real bug in payment logic for a cosmetic lint win.
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const renderRightSide = () => {
    if (loading) {
      return <SkeletonLoader />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
            <StatusIcon variant="failed" size={32} />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Checkout Error</h2>
          <p className="text-xs text-muted leading-relaxed">{error}</p>
        </div>
      );
    }

    if (!session) return null;

    // Terminal statuses
    if (session.status === SESSION_STATUS.PAID) {
      return <PaidView session={session} />;
    }
    if (session.status === SESSION_STATUS.FAILED) {
      return <FailedView />;
    }
    if (session.status === SESSION_STATUS.EXPIRED) {
      return <ExpiredView />;
    }

    // Awaiting Payment Details
    if (session.status === SESSION_STATUS.AWAITING_PAYMENT && !overrideSelection) {
      const attempt = session.paymentAttempt;
      if (!attempt) return null;

      const isCard =
        attempt.paymentMethod === CARD_PAYMENT_METHOD_CODE.MIDTRANS_CREDIT_CARD ||
        attempt.paymentMethod === CARD_PAYMENT_METHOD_CODE.XENDIT_CARDS;
      const isXenditComponentsCard = isCard && session.provider === PSP_PROVIDER.XENDIT;
      const isAwaitingCardInput =
        isCard && attempt.status === PAYMENT_ATTEMPT_STATUS.AWAITING_TOKEN;
      const hasVaProtocol =
        attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.MIDTRANS) === true ||
        attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.XENDIT) === true;

      return (
        <div className={`flex flex-col gap-5 ${isAwaitingCardInput ? '' : 'h-full'}`}>
          {/* Header Bar with Back Button */}
          <div className="flex items-center justify-between border-b border-lineSoft pb-3">
            <button
              type="button"
              onClick={() => {
                setOverrideSelection(true);
                setHasUserSelectedMethod(false);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors duration-150"
            >
              <ArrowLeft size={14} />
              Change Payment Method
            </button>
            <span className="text-[10px] text-muted flex items-center gap-1 font-mono uppercase bg-panel2 border border-lineSoft px-2.5 py-1 rounded-lg">
              {(attempt.paymentMethod ?? '').replace(/_/g, ' ')}
            </span>
          </div>

          <ErrorBanner
            message={formError}
            onClose={() => {
              setFormError(null);
            }}
          />

          <div
            ref={panelRef}
            className={`rounded-xl2 border border-lineSoft bg-panel2/30 p-6 ${
              isAwaitingCardInput ? '' : 'flex-1'
            }`}
          >
            {(() => {
              if (isAwaitingCardInput && isXenditComponentsCard && attempt.componentsSdkKey) {
                return (
                  <XenditCardComponent
                    componentsSdkKey={attempt.componentsSdkKey}
                    onComplete={() => {
                      void resolveXenditSession();
                    }}
                    onError={setFormError}
                  />
                );
              }
              if (isAwaitingCardInput) {
                return (
                  <CardForm
                    details={cardDetails}
                    onUpdateField={handleCardFieldChange}
                    hidePreview={reviewConfirmed}
                  />
                );
              }
              if (hasVaProtocol) {
                return <VirtualAccountForm paymentAttempt={attempt} />;
              }
              if (isCard) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center h-full max-w-xs mx-auto">
                    <div className="mb-4">
                      <StatusIcon variant="waiting" size={48} />
                    </div>
                    <p className="text-sm font-semibold text-text mb-2">Processing Card Payment</p>
                    <p className="text-xs text-muted leading-relaxed">
                      Confirming with your bank. Please do not close or refresh this tab.
                    </p>
                  </div>
                );
              }
              return <EwalletForm paymentAttempt={attempt} />;
            })()}
          </div>

          {/* Conditional Secure Notice & Footer */}
          {isAwaitingCardInput && isXenditComponentsCard && (
            <SecureNotice
              title="Secure payment"
              subtitle="Card details are entered directly into Xendit's secure fields and never touch PayBridge."
            />
          )}
          {isAwaitingCardInput && !isXenditComponentsCard && (
            <>
              <SecureNotice
                title="Secure payment"
                subtitle="Your card details are tokenized client-side directly with the gateway."
              />
              {isCardFormComplete(cardDetails) &&
                (reviewConfirmed ? (
                  <PaymentFooter
                    label={
                      submitting
                        ? PROCESSING_LABEL
                        : `Pay ${formatCurrency(session.amount, session.currency)}`
                    }
                    onSubmit={validateAndSubmitCard}
                  />
                ) : (
                  <PaymentFooter
                    label="Review Order"
                    onSubmit={() => {
                      setReviewConfirmed(true);
                    }}
                  />
                ))}
            </>
          )}
          {!isAwaitingCardInput && (
            <SecureNotice
              title="Waiting for confirmation"
              subtitle="We will automatically refresh as soon as payment is confirmed."
            />
          )}
        </div>
      );
    }

    // Method selection picker (renders on initial awaiting_method_selection OR when overrideSelection is active)
    if (session.status === SESSION_STATUS.AWAITING_METHOD_SELECTION || overrideSelection) {
      const availableCategories = new Set(
        session.availableMethods?.map((option) => option.category),
      );
      const hasCard = availableCategories.has(PAYMENT_METHOD_CATEGORY.CARD);
      const hasVa = availableCategories.has(PAYMENT_METHOD_CATEGORY.VIRTUAL_ACCOUNT);
      const hasEwallet =
        availableCategories.has(PAYMENT_METHOD_CATEGORY.E_WALLET) ||
        availableCategories.has(PAYMENT_METHOD_CATEGORY.QR_CODE);

      const tabs: { id: PaymentMethodTabId; label: string; icon: string }[] = [];
      if (hasVa)
        tabs.push({ id: PAYMENT_METHOD_TAB.VA, label: 'Virtual Account', icon: icons.bank });
      if (hasEwallet)
        tabs.push({ id: PAYMENT_METHOD_TAB.EWALLET, label: 'E-Wallet', icon: icons.wallet });
      if (hasCard) tabs.push({ id: PAYMENT_METHOD_TAB.CARD, label: 'Card', icon: icons.card });

      const labels: Record<PaymentMethodTabId, string> = {
        [PAYMENT_METHOD_TAB.CARD]: `Pay ${formatCurrency(session.amount, session.currency)}`,
        [PAYMENT_METHOD_TAB.VA]: 'Confirm Selected Bank',
        [PAYMENT_METHOD_TAB.EWALLET]: 'Continue to Wallet',
      };

      const notices: Record<PaymentMethodTabId, { title: string; subtitle: string }> = {
        [PAYMENT_METHOD_TAB.CARD]: {
          title: 'Secure payment',
          subtitle: 'You will enter card details tokenized securely directly with the provider.',
        },
        [PAYMENT_METHOD_TAB.VA]: {
          title: 'Bank transfer',
          subtitle: 'Select a bank to generate your unique virtual account details.',
        },
        [PAYMENT_METHOD_TAB.EWALLET]: {
          title: 'E-Wallet checkout',
          subtitle: "You will be redirected to the provider's payment page or scan a QR code.",
        },
      };

      return (
        <div
          className={`flex flex-col gap-5 ${
            hasUserSelectedMethod && method === PAYMENT_METHOD_TAB.CARD ? '' : 'h-full'
          } ${hasUserSelectedMethod ? '' : 'items-center justify-center max-w-md mx-auto w-full'}`}
        >
          {tabs.length > 0 && (
            <div className="w-full">
              <PaymentMethodTabs
                active={hasUserSelectedMethod ? method : null}
                onChange={(nextMethod) => {
                  setHasUserSelectedMethod(true);
                  setMethod(nextMethod);
                }}
                tabs={tabs}
              />
            </div>
          )}

          {hasUserSelectedMethod && (
            <div className="w-full flex flex-col gap-5">
              <ErrorBanner
                message={formError}
                onClose={() => {
                  setFormError(null);
                }}
              />

              <div
                ref={panelRef}
                className={`rounded-xl2 border border-lineSoft bg-panel2/30 p-6 ${
                  method === PAYMENT_METHOD_TAB.CARD ? '' : 'flex-1'
                }`}
              >
                {method === PAYMENT_METHOD_TAB.CARD && session.provider === PSP_PROVIDER.XENDIT && (
                  <div className="flex flex-col items-center justify-center py-16 text-center max-w-xs mx-auto">
                    <div className="mb-4">
                      <StatusIcon variant="waiting" size={48} />
                    </div>
                    <p className="text-sm font-semibold text-text">Preparing secure card form...</p>
                  </div>
                )}
                {method === PAYMENT_METHOD_TAB.CARD && session.provider !== PSP_PROVIDER.XENDIT && (
                  <CardForm
                    details={cardDetails}
                    onUpdateField={handleCardFieldChange}
                    hidePreview={reviewConfirmed}
                  />
                )}
                {method === PAYMENT_METHOD_TAB.VA && (
                  <VirtualAccountForm
                    availableMethods={session.availableMethods ?? []}
                    selectedMethod={selectedVaMethod}
                    setSelectedMethod={setSelectedVaMethod}
                  />
                )}
                {method === PAYMENT_METHOD_TAB.EWALLET && (
                  <EwalletForm
                    availableMethods={session.availableMethods ?? []}
                    selectedMethod={selectedEwalletMethod}
                    setSelectedMethod={setSelectedEwalletMethod}
                  />
                )}
              </div>
              <SecureNotice {...notices[method]} />
              {method === PAYMENT_METHOD_TAB.CARD && session.provider === PSP_PROVIDER.XENDIT
                ? null // XenditCardComponent (rendered once the session is created) owns its own submit button.
                : method === PAYMENT_METHOD_TAB.CARD && (
                    <>
                      {isCardFormComplete(cardDetails) &&
                        (reviewConfirmed ? (
                          <PaymentFooter
                            label={submitting ? PROCESSING_LABEL : labels[method]}
                            onSubmit={submitSelectedMethod}
                          />
                        ) : (
                          <PaymentFooter
                            label="Review Order"
                            onSubmit={() => {
                              setReviewConfirmed(true);
                            }}
                          />
                        ))}
                    </>
                  )}
              {method !== PAYMENT_METHOD_TAB.CARD && (
                <PaymentFooter
                  label={submitting ? PROCESSING_LABEL : labels[method]}
                  onSubmit={submitSelectedMethod}
                />
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const { number, firstName, lastName, expiry, cvv } = cardDetails;
  const hideOrderSummary =
    method === PAYMENT_METHOD_TAB.CARD &&
    Boolean(number || firstName || lastName || expiry || cvv) &&
    !reviewConfirmed;

  return (
    <div ref={cardRef}>
      <CheckoutTemplate
        left={<OrderSummaryPanel session={session} />}
        right={renderRightSide()}
        hideLeft={hideOrderSummary}
      />
    </div>
  );
}
