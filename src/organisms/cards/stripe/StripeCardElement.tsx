import { useEffect, useRef, useState } from 'react';

import { loadScript } from '../../../utils/loadScript';

// Stripe's own recommended way to load Stripe.js is a direct <script src> from their
// CDN, not a bundled npm package — required for their own fraud-detection/PCI posture.
// Matches this codebase's existing pattern for Xendit/Midtrans's SDKs.
const STRIPE_SCRIPT_URL = 'https://js.stripe.com/v3/';
const STRIPE_SCRIPT_ID = 'stripe-js-script';

interface StripePaymentElement {
  mount: (target: HTMLElement) => void;
  unmount?: () => void;
  on: (event: 'ready', handler: () => void) => void;
}

interface StripeElements {
  create: (type: 'payment') => StripePaymentElement;
  submit: () => Promise<{ error?: { message?: string } }>;
}

interface StripeConfirmResult {
  error?: { message?: string };
}

interface StripeInstance {
  elements: (options: { clientSecret: string }) => StripeElements;
  confirmPayment: (options: {
    elements: StripeElements;
    redirect: 'if_required';
  }) => Promise<StripeConfirmResult>;
  // The SetupIntent twin of confirmPayment: saves the card and charges nothing.
  confirmSetup: (options: {
    elements: StripeElements;
    redirect: 'if_required';
  }) => Promise<StripeConfirmResult>;
}

declare global {
  interface Window {
    STRIPE_PUBLISHABLE_KEY?: string;
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

interface StripeCardElementProps {
  clientSecret: string;
  onComplete: () => void;
  onError: (message: string) => void;
  // 'payment' (the default) confirms a PaymentIntent; 'setup' confirms a SetupIntent, for
  // saving a card with no charge -- the client secret decides which kind it is.
  intent?: 'payment' | 'setup';
  submitLabel?: string;
}

export default function StripeCardElement({
  clientSecret,
  onComplete,
  onError,
  intent = 'payment',
  submitLabel = 'Pay',
}: Readonly<StripeCardElementProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<StripeInstance | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const paymentElementRef = useRef<StripePaymentElement | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* eslint-disable react-doctor/effect-needs-cleanup -- false positive: the payment
     element registration happens inside the nested async `mount()`, but the returned
     cleanup does unmount it via paymentElementRef, populated at the same call site. */
  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      try {
        await loadScript(STRIPE_SCRIPT_ID, STRIPE_SCRIPT_URL);
        if (cancelled || !window.Stripe || !containerRef.current) return;

        const publishableKey = window.STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          onError('Card payment is not configured for this merchant.');
          return;
        }

        const stripe = window.Stripe(publishableKey);
        stripeRef.current = stripe;

        const elements = stripe.elements({ clientSecret });
        elementsRef.current = elements;

        const paymentElement = elements.create('payment');
        paymentElementRef.current = paymentElement;
        paymentElement.mount(containerRef.current);
        paymentElement.on('ready', () => {
          if (!cancelled) setReady(true);
        });
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load the card payment form.');
      }
    };

    void mount();

    return () => {
      cancelled = true;
      paymentElementRef.current?.unmount?.();
      paymentElementRef.current = null;
      elementsRef.current = null;
      stripeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret]);
  /* eslint-enable react-doctor/effect-needs-cleanup */

  const handleSubmit = async () => {
    const stripe = stripeRef.current;
    const elements = elementsRef.current;
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message ?? 'Please check your card details.');
        setSubmitting(false);
        return;
      }

      const confirmOptions = { elements, redirect: 'if_required' } as const;
      const { error } =
        intent === 'setup'
          ? await stripe.confirmSetup(confirmOptions)
          : await stripe.confirmPayment(confirmOptions);
      if (error) {
        onError(error.message ?? 'Card payment failed.');
        setSubmitting(false);
        return;
      }

      // Success, still-processing and requires_action all land here alike -- Stripe's
      // own Payment Element already ran any 3-D Secure challenge in-page (S12), and
      // resolve-session (via onComplete) reads the true PaymentIntent status
      // server-side rather than this component guessing from the client-side result.
      onComplete();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Card payment failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div ref={containerRef} className="min-h-[120px]" />
      <button
        type="button"
        disabled={!ready || submitting}
        onClick={() => {
          void handleSubmit();
        }}
        className="w-full bg-brand text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {submitting ? 'Processing...' : submitLabel}
      </button>
    </div>
  );
}
