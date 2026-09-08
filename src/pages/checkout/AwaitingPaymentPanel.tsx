import type { RefObject } from 'react';

import { ArrowLeft } from 'lucide-react';

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
  onChangePaymentMethod: () => void;
}

// Dispatches to the Card/VA/E-wallet view that owns this attempt's checkoutUrl shape —
// see CardMethodView/VaMethodView/EwalletMethodView for each method's own rendering.
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
  onChangePaymentMethod,
}: Readonly<AwaitingPaymentPanelProps>) {
  const attempt = session.paymentAttempt;
  if (!attempt) return null;

  const isCard =
    attempt.paymentMethod === CARD_PAYMENT_METHOD_CODE.MIDTRANS_CREDIT_CARD ||
    attempt.paymentMethod === CARD_PAYMENT_METHOD_CODE.XENDIT_CARDS;
  const isAwaitingCardInput = isCard && attempt.status === PAYMENT_ATTEMPT_STATUS.AWAITING_TOKEN;
  const isVa =
    attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.MIDTRANS) === true ||
    attempt.checkoutUrl?.startsWith(VA_PROTOCOL_PREFIX.XENDIT) === true;

  return (
    <div className={`flex flex-col gap-5 ${isAwaitingCardInput ? '' : 'h-full'}`}>
      {/* Header Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-lineSoft pb-3">
        <button
          type="button"
          onClick={onChangePaymentMethod}
          className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors duration-150"
        >
          <ArrowLeft size={14} />
          Change Payment Method
        </button>
        <span className="text-[10px] text-muted flex items-center gap-1 font-mono uppercase bg-panel2 border border-lineSoft px-2.5 py-1 rounded-lg">
          {(attempt.paymentMethod ?? '').replace(/_/g, ' ')}
        </span>
      </div>

      <ErrorBanner
        message={formError}
        onClose={() => {
          setFormError(null);
        }}
      />

      <div
        ref={panelRef}
        className={`rounded-xl2 border border-lineSoft bg-panel2/30 p-6 flex flex-col gap-5 ${
          isAwaitingCardInput ? '' : 'flex-1'
        }`}
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
    </div>
  );
}
