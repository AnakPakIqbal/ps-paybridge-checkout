import { useEffect, useRef, useState } from 'react';

import type { SaveCardPreparation, SubscriptionSessionView } from '../types/subscription';

import { ApiError } from '../services/http';
import {
  activateSubscription,
  cancelSubscriptionSession,
  fetchSubscriptionSession,
  prepareSaveCard,
} from '../services/subscriptionApi';
import { SUBSCRIPTION_MODE, SUBSCRIPTION_SESSION_STATE } from '../types/subscription';
import { readFragmentToken, resolveRoute } from '../utils/route';
import { useLocationHash, useLocationPathname } from './useLocation';

// A subscription settles in seconds at most; nothing here needs live push.
const POLL_INTERVAL_MS = 4000;
// While the provider confirms a card (Xendit answers a moment after the customer submits)
// the page asks again this often, this many times, before telling the customer to wait.
const ACTIVATION_RETRY_INTERVAL_MS = 2000;
const ACTIVATION_MAX_ATTEMPTS = 30;
const HTTP_UNAUTHORIZED = 401;

const LINK_INVALID_MESSAGE =
  'This subscription link has expired or is no longer valid. Please contact the merchant for a new one.';

function describeError(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.status === HTTP_UNAUTHORIZED) return LINK_INVALID_MESSAGE;
  return err instanceof Error ? err.message : fallback;
}

// A provider failure while starting the card form is not something a customer can act on,
// and its raw message names internals ("components_configuration.origins need to use HTTPS").
// Show a plain one; the detail is in the server log.
function describePrepareError(err: unknown): string {
  if (err instanceof ApiError && err.status === HTTP_UNAUTHORIZED) return LINK_INVALID_MESSAGE;
  return 'We could not start the secure card form. Please try again in a moment, or contact the merchant.';
}

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

// Asks the server to turn a saved card into a subscription until it decides. Xendit answers
// a moment after the customer submits, so a `pending` reply means "ask again", not "failed".
// Returns false if it never decided within the allowed attempts.
async function activateUntilDecided(
  sessionId: string,
  token: string,
  savedTokenId: string | undefined,
  onView: (view: SubscriptionSessionView) => void,
): Promise<boolean> {
  for (let attempt = 0; attempt < ACTIVATION_MAX_ATTEMPTS; attempt += 1) {
    const result = await activateSubscription(sessionId, token, savedTokenId);
    onView(result.view);
    if (!result.pending) return true;
    await sleep(ACTIVATION_RETRY_INTERVAL_MS);
  }
  return false;
}

interface UseSubscriptionSessionResult {
  view: SubscriptionSessionView | null;
  loading: boolean;
  // Load-level failure: the page cannot show anything useful.
  error: string | null;
  // Create mode: what the browser needs to draw the provider's card UI. Null until ready.
  prepared: SaveCardPreparation | null;
  prepareError: string | null;
  retryPrepare: () => void;
  activating: boolean;
  cancelling: boolean;
  // A failed activate or cancel: the page stays usable so the customer can try again.
  actionError: string | null;
  activate: (savedTokenId?: string) => Promise<void>;
  cancel: () => Promise<void>;
  reportCardError: (message: string) => void;
  dismissActionError: () => void;
}

/**
 * Loads the subscription session for /subscription/:id (token from the URL fragment), and
 * runs its two customer actions: create mode's card save and activation, and manage
 * mode's cancel.
 */
export function useSubscriptionSession(): UseSubscriptionSessionResult {
  // The URL cannot change without a full page load, so these are fixed for the page's life.
  const sessionId = resolveRoute(useLocationPathname()).id;
  const token = readFragmentToken(useLocationHash());

  const [view, setView] = useState<SubscriptionSessionView | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId && token));
  const [error, setError] = useState<string | null>(() => {
    if (!sessionId) return 'Subscription session ID is missing from the URL path.';
    if (!token) return 'Authorization token is missing from the URL fragment.';
    return null;
  });
  const [prepared, setPrepared] = useState<SaveCardPreparation | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // State updates are asynchronous, so two quick clicks would both see `false`. The refs
  // close that gap; the server is idempotent as well.
  const busyRef = useRef(false);
  // A Xendit card session cannot be recreated under the same reference, so never start two.
  const prepareStartedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !token) return;

    let cancelled = false;
    fetchSubscriptionSession(sessionId, token)
      .then((loaded) => {
        if (cancelled) return;
        setView(loaded);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(describeError(err, 'Failed to load this subscription.'));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  const awaitingCard =
    view?.mode === SUBSCRIPTION_MODE.CREATE &&
    view.state === SUBSCRIPTION_SESSION_STATE.AWAITING_CARD;

  useEffect(() => {
    if (!awaitingCard || !sessionId || !token) return;
    if (prepared || prepareError || prepareStartedRef.current) return;

    prepareStartedRef.current = true;
    prepareSaveCard(sessionId, token)
      .then(setPrepared)
      .catch((err: unknown) => {
        setPrepareError(describePrepareError(err));
      });
  }, [awaitingCard, sessionId, token, prepared, prepareError]);

  const state = view?.state;
  useEffect(() => {
    if (state !== SUBSCRIPTION_SESSION_STATE.ACTIVATING || !sessionId || !token) return;

    const timer = setInterval(() => {
      fetchSubscriptionSession(sessionId, token)
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

  const retryPrepare = () => {
    prepareStartedRef.current = false;
    setPrepared(null);
    setPrepareError(null);
  };

  const activate = async (savedTokenId?: string): Promise<void> => {
    if (!sessionId || !token || busyRef.current) return;

    busyRef.current = true;
    setActivating(true);
    setActionError(null);
    try {
      const decided = await activateUntilDecided(sessionId, token, savedTokenId, setView);
      if (!decided) {
        setActionError(
          'Your card is still being confirmed. Please wait a moment and refresh this page.',
        );
      }
    } catch (err) {
      setActionError(describeError(err, 'Failed to start the subscription.'));
    } finally {
      busyRef.current = false;
      setActivating(false);
    }
  };

  const cancel = async (): Promise<void> => {
    if (!sessionId || !token || busyRef.current) return;

    busyRef.current = true;
    setCancelling(true);
    setActionError(null);
    try {
      setView(await cancelSubscriptionSession(sessionId, token));
    } catch (err) {
      setActionError(describeError(err, 'Failed to cancel the subscription.'));
    } finally {
      busyRef.current = false;
      setCancelling(false);
    }
  };

  // The provider's own card UI reports its failures (a declined card, a bad number) itself;
  // this just surfaces them in the same place as every other action error.
  const reportCardError = (message: string) => {
    setActionError(message);
  };

  const dismissActionError = () => {
    setActionError(null);
  };

  return {
    view,
    loading,
    error,
    prepared,
    prepareError,
    retryPrepare,
    activating,
    cancelling,
    actionError,
    activate,
    cancel,
    reportCardError,
    dismissActionError,
  };
}
