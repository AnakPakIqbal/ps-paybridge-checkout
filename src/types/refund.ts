// Mirrors RefundSessionView in the backend (src/modules/refund-session). Dates arrive as
// ISO strings over JSON.

export const REFUND_SESSION_STATE = {
  READY: 'ready',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  UNAVAILABLE: 'unavailable',
} as const;

export type RefundSessionState = (typeof REFUND_SESSION_STATE)[keyof typeof REFUND_SESSION_STATE];

export const REFUND_STATUS = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export interface RefundSessionRefund {
  id: string;
  amount: number;
  status: RefundStatus;
  failureCode: string | null;
  createdAt: string;
}

export interface RefundSessionView {
  id: string;
  merchantName: string;
  description: string;
  currency: string;
  chargeAmount: number;
  amountCap: number | null;
  // What confirming would refund right now -- computed live by the server.
  refundableAmount: number;
  state: RefundSessionState;
  // The merchant-fixed reason. Null means the customer may supply one.
  reason: string | null;
  expiresAt: string;
  refunds: RefundSessionRefund[];
}
