import type {
  ActivationResult,
  SaveCardPreparation,
  SubscriptionSessionView,
} from '../types/subscription';

import { requestJson, requestJsonWithStatus } from './http';

const HTTP_ACCEPTED = 202;

export function fetchSubscriptionSession(
  sessionId: string,
  token: string,
): Promise<SubscriptionSessionView> {
  return requestJson<SubscriptionSessionView>(
    `/subscription/${sessionId}/session`,
    token,
    'Failed to load this subscription.',
  );
}

export function prepareSaveCard(sessionId: string, token: string): Promise<SaveCardPreparation> {
  return requestJson<SaveCardPreparation>(
    `/subscription/${sessionId}/prepare-card`,
    token,
    'Failed to start the card form.',
    {},
  );
}

// Only Midtrans sends a token: its browser SDK registers the card and hands the result back
// here. Stripe and Xendit are resolved server-side from the session prepare-card recorded.
export async function activateSubscription(
  sessionId: string,
  token: string,
  savedTokenId?: string,
): Promise<ActivationResult> {
  const { data, status } = await requestJsonWithStatus<SubscriptionSessionView>(
    `/subscription/${sessionId}/activate`,
    token,
    'Failed to start the subscription.',
    savedTokenId ? { savedTokenId } : {},
  );
  return { view: data, pending: status === HTTP_ACCEPTED };
}

export function cancelSubscriptionSession(
  sessionId: string,
  token: string,
): Promise<SubscriptionSessionView> {
  return requestJson<SubscriptionSessionView>(
    `/subscription/${sessionId}/cancel`,
    token,
    'Failed to cancel the subscription.',
    {},
  );
}
