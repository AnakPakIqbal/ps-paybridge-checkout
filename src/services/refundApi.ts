import type { RefundSessionView } from '../types/refund';

import { requestJson } from './http';

export function fetchRefundSession(sessionId: string, token: string): Promise<RefundSessionView> {
  return requestJson<RefundSessionView>(
    `/refund/${sessionId}/session`,
    token,
    'Failed to load this refund.',
  );
}

// The customer never sends an amount: the merchant fixed it when minting the link, and
// the server refunds whatever is refundable at that moment. Only an optional reason is
// accepted, and only when the merchant did not fix one.
export function confirmRefund(
  sessionId: string,
  token: string,
  reason?: string,
): Promise<RefundSessionView> {
  return requestJson<RefundSessionView>(
    `/refund/${sessionId}/confirm`,
    token,
    'Failed to submit the refund.',
    reason ? { reason } : {},
  );
}
