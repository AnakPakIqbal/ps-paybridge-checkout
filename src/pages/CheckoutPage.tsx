import gsap from 'gsap';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type {
  CardTokenDetails,
  CheckoutSession,
  PaymentMethodTabId,
  PspProvider,
} from '../types/checkout';

import { icons } from '../atoms/icons';
import { isCardFormComplete, useCardForm } from '../hooks/useCardForm';
import SecureNotice from '../molecules/SecureNotice';
import CardForm from '../organisms/CardForm';
import EwalletForm from '../organisms/EwalletForm';
import OrderSummaryPanel from '../organisms/OrderSummaryPanel';
import PaymentFooter from '../organisms/PaymentFooter';
import PaymentMethodTabs from '../organisms/PaymentMethodTabs';
import VirtualAccountForm from '../organisms/VirtualAccountForm';
import {
  fetchCheckoutSession,
  openCheckoutEventStream,
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

declare global {
  interface Window {
    MIDTRANS_CLIENT_KEY?: string;
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

// Helper function to dynamically load JS script SDKs
function loadScript(id: string, src: string, attributes: Record<string, string> = {}) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([key, val]) => {
      script.setAttribute(key, val);
    });
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.body.appendChild(script);
  });
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
  if (hasCard) tab = PAYMENT_METHOD_TAB.CARD;
  else if (hasVa) tab = PAYMENT_METHOD_TAB.VA;
  else if (hasEwallet) tab = PAYMENT_METHOD_TAB.EWALLET;

  return {
    vaMethodCode: firstVaMethod?.code ?? null,
    ewalletMethodCode: firstWalletMethod?.code ?? null,
    tab,
  };
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
      <div className="w-20 h-20 bg-brandDim/80 border border-brand/35 rounded-full flex items-center justify-center text-brand mb-6 shadow-xl shadow-brand/10 animate-bounce">
        <CheckCircle2 size={44} />
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
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-xl shadow-red-500/5">
        <XCircle size={44} />
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
      <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 mb-6 shadow-xl shadow-yellow-500/5">
        <Clock size={44} />
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
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  // Tokenize card and complete card charge flow. Returns the PSP token string,
  // or null when the provider (Xendit) needs raw card details instead of a token.
  const tokenizeCard = async (
    provider: PspProvider,
    cardDetailsObj: CardTokenDetails,
  ): Promise<string | null> => {
    const { number, cvv, expiryMonth, expiryYear } = cardDetailsObj;

    if (provider === PSP_PROVIDER.MIDTRANS) {
      const clientKey = window.MIDTRANS_CLIENT_KEY ?? '';
      const isSandbox = clientKey.startsWith('SB-Mid-');
      const environment = isSandbox ? 'sandbox' : 'production';

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
  };

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
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-5">
            <XCircle size={32} />
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
      const hasVaProtocol =
        attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.MIDTRANS) === true ||
        attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.XENDIT) === true;

      return (
        <div
          className={`flex flex-col gap-5 ${
            isCard && attempt.status === PAYMENT_ATTEMPT_STATUS.AWAITING_TOKEN ? '' : 'h-full'
          }`}
        >
          {/* Header Bar with Back Button */}
          <div className="flex items-center justify-between border-b border-lineSoft pb-3">
            <button
              type="button"
              onClick={() => {
                setOverrideSelection(true);
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
              isCard && attempt.status === PAYMENT_ATTEMPT_STATUS.AWAITING_TOKEN ? '' : 'flex-1'
            }`}
          >
            {(() => {
              if (isCard && attempt.status === PAYMENT_ATTEMPT_STATUS.AWAITING_TOKEN) {
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
                    <div className="w-12 h-12 rounded-full border-4 border-brand border-t-transparent animate-spin mb-4" />
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
          {isCard && attempt.status === PAYMENT_ATTEMPT_STATUS.AWAITING_TOKEN ? (
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
                        ? 'Processing...'
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
          ) : (
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
      if (hasCard) tabs.push({ id: PAYMENT_METHOD_TAB.CARD, label: 'Card', icon: icons.card });
      if (hasVa)
        tabs.push({ id: PAYMENT_METHOD_TAB.VA, label: 'Virtual Account', icon: icons.bank });
      if (hasEwallet)
        tabs.push({ id: PAYMENT_METHOD_TAB.EWALLET, label: 'E-Wallet', icon: icons.wallet });

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
          className={`flex flex-col gap-5 ${method === PAYMENT_METHOD_TAB.CARD ? '' : 'h-full'}`}
        >
          {/* Show "Back to active payment details" if they have an active attempt and are overriding selection */}
          {session.paymentAttempt && overrideSelection && (
            <div className="flex items-center border-b border-lineSoft pb-3">
              <button
                type="button"
                onClick={() => {
                  setOverrideSelection(false);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors duration-150"
              >
                <ArrowLeft size={14} />
                Back to active payment details
              </button>
            </div>
          )}

          {tabs.length > 0 && (
            <PaymentMethodTabs active={method} onChange={setMethod} tabs={tabs} />
          )}

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
            {method === PAYMENT_METHOD_TAB.CARD && (
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
          {method === PAYMENT_METHOD_TAB.CARD ? (
            isCardFormComplete(cardDetails) &&
            (reviewConfirmed ? (
              <PaymentFooter
                label={submitting ? 'Processing...' : labels[method]}
                onSubmit={submitSelectedMethod}
              />
            ) : (
              <PaymentFooter
                label="Review Order"
                onSubmit={() => {
                  setReviewConfirmed(true);
                }}
              />
            ))
          ) : (
            <PaymentFooter
              label={submitting ? 'Processing...' : labels[method]}
              onSubmit={submitSelectedMethod}
            />
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
