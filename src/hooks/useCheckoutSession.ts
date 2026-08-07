import { useEffect, useRef, useState } from 'react';

import type { CheckoutSession, PaymentMethodTabId } from '../types/checkout';

import { fetchCheckoutSession, openCheckoutEventStream } from '../services/checkoutApi';
import { SESSION_STATUS } from '../types/checkout';
import { deriveInitialMethodSelection } from '../utils/checkoutHelpers';

export interface UseCheckoutSessionResult {
  sessionId: string | null;
  token: string | null;
  setToken: (token: string) => void;
  session: CheckoutSession | null;
  setSession: (session: CheckoutSession) => void;
  loading: boolean;
  error: string | null;
  subscribeToSSE: (sessionId: string, token: string) => void;
}

/**
 * Provider-agnostic session bootstrap: parses the session id/token out of the
 * URL, fetches the initial session, seeds VA/e-wallet/tab selection from the
 * available methods, and (re)subscribes to the SSE event stream whenever the
 * session enters awaiting_payment.
 */
export function useCheckoutSession(
  setSelectedVaMethod: (code: string) => void,
  setSelectedEwalletMethod: (code: string) => void,
  setMethod: (tab: PaymentMethodTabId) => void,
): UseCheckoutSessionResult {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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

  const fetchSession = async (sid: string, tkn: string) => {
    try {
      const sess = await fetchCheckoutSession(sid, tkn);
      setSession(sess);

      if (sess.checkoutToken) {
        setToken(sess.checkoutToken);
      }

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

  return { sessionId, token, setToken, session, setSession, loading, error, subscribeToSSE };
}
