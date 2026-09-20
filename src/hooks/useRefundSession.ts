import { useEffect, useRef, useState } from 'react';

import type { RefundSessionView } from '../types/refund';

import { ApiError } from '../services/http';
import { confirmRefund, fetchRefundSession } from '../services/refundApi';
import { REFUND_SESSION_STATE } from '../types/refund';
import { readFragmentToken, resolveRoute } from '../utils/route';
import { useLocationHash, useLocationPathname } from './useLocation';

// A pending refund settles in seconds to minutes at the PSP -- nothing here needs the
// sub-second interactivity of the live checkout page, so plain polling is enough (and no
// SSE stream exists for refunds).
const POLL_INTERVAL_MS = 4000;
const HTTP_UNAUTHORIZED = 401;

const LINK_INVALID_MESSAGE =
  'This refund link has expired or is no longer valid. Please contact the merchant for a new one.';

function describeError(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.status === HTTP_UNAUTHORIZED) return LINK_INVALID_MESSAGE;
  return err instanceof Error ? err.message : fallback;
}

interface UseRefundSessionResult {
  view: RefundSessionView | null;
  loading: boolean;
  // Load-level failure: the page cannot show anything useful.
  error: string | null;
  submitting: boolean;
  // A failed confirm: the page stays usable so the customer can try again.
  confirmError: string | null;
  confirm: (reason?: string) => Promise<void>;
  dismissConfirmError: () => void;
}

/**
 * Loads the refund session for /refund/:id (token from the URL fragment), polls it while
 * a refund is still processing, and submits the confirm.
 */
export function useRefundSession(): UseRefundSessionResult {
  // The URL cannot change without a full page load, so these are fixed for the page's life.
  const sessionId = resolveRoute(useLocationPathname()).id;
  const token = readFragmentToken(useLocationHash());

  const [view, setView] = useState<RefundSessionView | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId && token));
  const [error, setError] = useState<string | null>(() => {
    if (!sessionId) return 'Refund session ID is missing from the URL path.';
    if (!token) return 'Authorization token is missing from the URL fragment.';
    return null;
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // State updates are asynchronous, so two clicks in the same tick would both see
  // `submitting === false`. The ref closes that gap; the server is idempotent as well.
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !token) return;

    let cancelled = false;
    fetchRefundSession(sessionId, token)
      .then((loaded) => {
        if (cancelled) return;
        setView(loaded);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(describeError(err, 'Failed to load this refund.'));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  const state = view?.state;
  useEffect(() => {
    if (state !== REFUND_SESSION_STATE.PROCESSING || !sessionId || !token) return;

    const timer = setInterval(() => {
      fetchRefundSession(sessionId, token)
        .then(setView)
        .catch((err: unknown) => {
          // A transient failure is retried on the next tick; only a dead link is fatal.
          if (err instanceof ApiError && err.status === HTTP_UNAUTHORIZED) {
            setError(LINK_INVALID_MESSAGE);
          }
        });
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [state, sessionId, token]);

  const confirm = async (reason?: string): Promise<void> => {
    if (!sessionId || !token || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setConfirmError(null);
    try {
      setView(await confirmRefund(sessionId, token, reason));
    } catch (err) {
      setConfirmError(describeError(err, 'Failed to submit the refund.'));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const dismissConfirmError = () => {
    setConfirmError(null);
  };

  return { view, loading, error, submitting, confirmError, confirm, dismissConfirmError };
}
