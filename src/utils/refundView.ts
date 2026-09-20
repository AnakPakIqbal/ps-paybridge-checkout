import type { RefundSessionRefund, RefundSessionView } from '../types/refund';

import { REFUND_STATUS } from '../types/refund';

export function sumRefundsByStatus(
  refunds: RefundSessionRefund[],
  status: RefundSessionRefund['status'],
): number {
  return refunds
    .filter((refund) => refund.status === status)
    .reduce((total, refund) => total + refund.amount, 0);
}

// A confirm the payment provider definitively rejected leaves the session ready again;
// the page says so, so the customer understands why they are asked to confirm a second
// time.
export function latestFailedRefund(view: RefundSessionView): RefundSessionRefund | undefined {
  return view.refunds.findLast((refund) => refund.status === REFUND_STATUS.FAILED);
}
