import type { RefObject } from 'react';

import { ArrowLeft, Landmark, QrCode } from 'lucide-react';
import {
  JCBLogoIcon,
  MastercardLogoIcon,
  VisaLogoIcon,
} from 'react-svg-credit-card-payment-icons';

import type { CardDetails } from '../../hooks/useCardForm';
import type { CheckoutSession } from '../../types/checkout';

import { ErrorBanner } from '../../molecules/StatusViews';
import {
  CARD_PAYMENT_METHOD_CODE,
  PAYMENT_ATTEMPT_STATUS,
  VA_PROTOCOL_PREFIX,
} from '../../types/checkout';
import { CardAwaitingPayment } from './method-views/CardMethodView';
import { EwalletAwaitingPayment } from './method-views/EwalletMethodView';
import { VaAwaitingPayment } from './method-views/VaMethodView';

export interface AwaitingPaymentPanelProps {
  session: CheckoutSession;
  panelRef: RefObject<HTMLDivElement>;
  formError: string | null;
  setFormError: (message: string | null) => void;
  cardDetails: CardDetails;
  handleCardFieldChange: <TField extends keyof CardDetails>(
    field: TField,
    value: CardDetails[TField],
  ) => void;
  reviewConfirmed: boolean;
  setReviewConfirmed: (value: boolean) => void;
  submitting: boolean;
  validateAndSubmitCard: () => void;
  resolveXenditSession: () => Promise<void>;
  resolveStripeSession: () => Promise<void>;
  onChangePaymentMethod: () => void;
}

export default function AwaitingPaymentPanel({
  session,
  panelRef,
  formError,
  setFormError,
  cardDetails,
  handleCardFieldChange,
  reviewConfirmed,
  setReviewConfirmed,
  submitting,
  validateAndSubmitCard,
  resolveXenditSession,
  resolveStripeSession,
  onChangePaymentMethod,
}: Readonly<AwaitingPaymentPanelProps>) {
  const attempt = session.paymentAttempt;
  if (!attempt) return null;

  const isCard =
    attempt.paymentMethod === CARD_PAYMENT_METHOD_CODE.MIDTRANS_CREDIT_CARD ||
    attempt.paymentMethod === CARD_PAYMENT_METHOD_CODE.XENDIT_CARDS ||
    attempt.paymentMethod === CARD_PAYMENT_METHOD_CODE.STRIPE_CARD;
  const isAwaitingCardInput = isCard && attempt.status === PAYMENT_ATTEMPT_STATUS.AWAITING_TOKEN;
  const isVa =
    attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.MIDTRANS) === true ||
    attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.XENDIT) === true;

  const methodName = (attempt.paymentMethod ?? '').replace(/_/g, ' ');

  return (
    <div className="flex flex-col">
      {/* Header Bar with Back Button & Existing Payment Method Logos */}
      <div className="flex items-center justify-between border-b border-lineSoft pb-3 mb-4">
        <button
          type="button"
          onClick={onChangePaymentMethod}
          className="flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand/80 transition-colors"
        >
          <ArrowLeft size={14} />
          Change Payment Method
        </button>

        {isCard && (
          <div className="flex items-center gap-1.5 bg-white border border-lineSoft px-2.5 py-1 rounded-full shadow-2xs">
            <VisaLogoIcon width={28} className="h-3.5 w-auto" />
            <MastercardLogoIcon width={20} className="h-3.5 w-auto" />
            <JCBLogoIcon width={18} className="h-3.5 w-auto" />
          </div>
        )}

        {!isCard && isVa && (
          <span className="text-[11px] text-text flex items-center gap-1.5 bg-white border border-lineSoft px-3 py-1 rounded-full font-semibold shadow-2xs">
            <Landmark size={13} className="text-emerald-600" />
            <span>{methodName || 'Virtual Account'}</span>
          </span>
        )}

        {!isCard && !isVa && (
          <span className="text-[11px] text-text flex items-center gap-1.5 bg-white border border-lineSoft px-3 py-1 rounded-full font-semibold shadow-2xs">
            <QrCode size={13} className="text-purple-600" />
            <span>{methodName || 'QRIS / E-Wallet'}</span>
          </span>
        )}
      </div>

      <ErrorBanner
        message={formError}
        onClose={() => {
          setFormError(null);
        }}
      />

      {/* Payment Action Panel */}
      <div
        ref={panelRef}
        className="rounded-2xl border border-lineSoft bg-panel2/40 p-6 flex flex-col gap-5 shadow-xs my-2"
      >
        {isCard && (
          <CardAwaitingPayment
            session={session}
            isAwaitingCardInput={isAwaitingCardInput}
            cardDetails={cardDetails}
            handleCardFieldChange={handleCardFieldChange}
            reviewConfirmed={reviewConfirmed}
            setReviewConfirmed={setReviewConfirmed}
            submitting={submitting}
            setFormError={setFormError}
            validateAndSubmitCard={validateAndSubmitCard}
            resolveXenditSession={resolveXenditSession}
            resolveStripeSession={resolveStripeSession}
          />
        )}
        {!isCard && isVa && <VaAwaitingPayment attempt={attempt} />}
        {!isCard && !isVa && (
          <EwalletAwaitingPayment
            attempt={attempt}
            amount={session.amount}
            currency={session.currency}
          />
        )}
      </div>

      <p className="text-[11px] text-muted text-center mt-3 leading-relaxed">
        Complete your transfer or authorization on your device. Once received, this screen will
        update to confirmed.
      </p>
    </div>
  );
}
