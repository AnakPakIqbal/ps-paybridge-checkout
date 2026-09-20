import type { PspProvider } from './checkout';

// Mirrors SubscriptionSessionView in the backend (src/modules/subscription-session).
// Dates arrive as ISO strings over JSON.

export const SUBSCRIPTION_MODE = {
  CREATE: 'create',
  MANAGE: 'manage',
} as const;

export type SubscriptionMode = (typeof SUBSCRIPTION_MODE)[keyof typeof SUBSCRIPTION_MODE];

export const SUBSCRIPTION_SESSION_STATE = {
  AWAITING_CARD: 'awaiting_card',
  ACTIVATING: 'activating',
  ACTIVE: 'active',
  REQUIRES_ACTION: 'requires_action',
  CANCELED: 'canceled',
} as const;

export type SubscriptionSessionState =
  (typeof SUBSCRIPTION_SESSION_STATE)[keyof typeof SUBSCRIPTION_SESSION_STATE];

export interface SubscriptionSessionView {
  id: string;
  mode: SubscriptionMode;
  merchantName: string;
  state: SubscriptionSessionState;
  provider: PspProvider;
  plan: {
    amount: number;
    currency: string;
    // DAY | WEEK | MONTH | YEAR
    interval: string;
    intervalCount: number;
    totalRecurrence: number | null;
    // Known only before the subscription exists.
    description: string | null;
    anchorDate: string;
  };
  subscription: {
    id: string;
    status: string;
    // Derived from the schedule by the server; null once cancelled or exhausted.
    nextBillingDate: string | null;
  } | null;
  expiresAt: string;
}

// What the browser needs to show the provider's own card UI. Stripe gets a client secret,
// Xendit an SDK key, Midtrans neither (its browser SDK registers the card on its own).
export interface SaveCardPreparation {
  provider: PspProvider;
  clientSecret?: string;
  componentsSdkKey?: string;
}

export interface ActivationResult {
  view: SubscriptionSessionView;
  // True while the provider has not yet confirmed the card: nothing is decided, ask again.
  pending: boolean;
}
