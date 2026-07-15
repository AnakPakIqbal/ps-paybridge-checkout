import type { ApiErrorEnvelope, ApiSuccessEnvelope, CheckoutSession } from '../types/checkout';

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch((): ApiErrorEnvelope => ({}))) as ApiErrorEnvelope;
  return data.error?.message ?? fallback;
}

async function requestSession(
  res: Response,
  fallbackErrorMessage: string,
): Promise<CheckoutSession> {
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, fallbackErrorMessage));
  }
  const data = (await res.json()) as ApiSuccessEnvelope<CheckoutSession>;
  return data.data;
}

export function fetchCheckoutSession(sessionId: string, token: string): Promise<CheckoutSession> {
  return fetch(`/checkout/${sessionId}/session`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => requestSession(res, `Failed to retrieve checkout session (${res.status})`));
}

export function selectCheckoutMethod(
  sessionId: string,
  token: string,
  paymentMethod: string,
): Promise<CheckoutSession> {
  return fetch(`/checkout/${sessionId}/select-method`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ paymentMethod }),
  }).then((res) => requestSession(res, 'Failed to select payment method.'));
}

export function submitCardToken(
  sessionId: string,
  token: string,
  cardTokenBody: Record<string, unknown>,
): Promise<CheckoutSession> {
  return fetch(`/checkout/${sessionId}/card-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cardTokenBody),
  }).then((res) => requestSession(res, 'Failed to complete credit card transaction.'));
}

export function openCheckoutEventStream(sessionId: string, token: string): EventSource {
  return new EventSource(`/checkout/${sessionId}/events?token=${encodeURIComponent(token)}`);
}
