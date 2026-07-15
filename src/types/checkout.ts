export const PAYMENT_METHOD_CATEGORY = {
  CARD: 'card',
  VIRTUAL_ACCOUNT: 'virtual_account',
  E_WALLET: 'e_wallet',
  QR_CODE: 'qr_code',
} as const;

export type PaymentMethodCategory =
  (typeof PAYMENT_METHOD_CATEGORY)[keyof typeof PAYMENT_METHOD_CATEGORY];

// The three tabs shown in the checkout UI — a UI-level grouping distinct from
// PaymentMethodCategory (e_wallet and qr_code both map to the "ewallet" tab).
export const PAYMENT_METHOD_TAB = {
  CARD: 'card',
  VA: 'va',
  EWALLET: 'ewallet',
} as const;

export type PaymentMethodTabId = (typeof PAYMENT_METHOD_TAB)[keyof typeof PAYMENT_METHOD_TAB];

export interface PaymentMethodOption {
  code: string;
  name: string;
  category: PaymentMethodCategory;
}

export const SESSION_STATUS = {
  AWAITING_METHOD_SELECTION: 'awaiting_method_selection',
  AWAITING_PAYMENT: 'awaiting_payment',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const PAYMENT_ATTEMPT_STATUS = {
  AWAITING_TOKEN: 'awaiting_token',
} as const;

export type PaymentAttemptStatus =
  (typeof PAYMENT_ATTEMPT_STATUS)[keyof typeof PAYMENT_ATTEMPT_STATUS];

export const PSP_PROVIDER = {
  MIDTRANS: 'midtrans',
  XENDIT: 'xendit',
} as const;

export type PspProvider = (typeof PSP_PROVIDER)[keyof typeof PSP_PROVIDER];

export const CARD_PAYMENT_METHOD_CODE = {
  MIDTRANS_CREDIT_CARD: 'credit_card',
  XENDIT_CARDS: 'CARDS',
} as const;

export const VA_PROTOCOL_PREFIX = {
  MIDTRANS: 'midtrans-va://',
  XENDIT: 'xendit-va://',
} as const;

export interface PaymentAttempt {
  status: string;
  paymentMethod?: string;
  checkoutUrl?: string;
}

export interface CheckoutSession {
  status: SessionStatus;
  amount: number;
  currency: string;
  orderId: string;
  provider: PspProvider;
  checkoutToken?: string;
  availableMethods?: PaymentMethodOption[];
  paymentAttempt?: PaymentAttempt;
}

export interface CardTokenDetails {
  number: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  firstName: string;
  lastName: string;
}

export interface ApiSuccessEnvelope<TData> {
  data: TData;
}

export interface ApiErrorEnvelope {
  error?: { message?: string };
}
