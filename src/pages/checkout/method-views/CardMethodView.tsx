import type { CardDetails } from '../../../hooks/useCardForm';
import type { CheckoutSession } from '../../../types/checkout';

import StatusIcon from '../../../atoms/StatusIcon';
import { isCardFormComplete } from '../../../hooks/useCardForm';
import SecureNotice from '../../../molecules/SecureNotice';
import MidtransCardForm from '../../../organisms/cards/midtrans/MidtransCardForm';
import XenditCardComponent from '../../../organisms/cards/xendit/XenditCardComponent';
import PaymentFooter from '../../../organisms/PaymentFooter';
import { PSP_PROVIDER } from '../../../types/checkout';
import { formatCurrency } from '../../../utils/formatCurrency';

const PROCESSING_LABEL = 'Processing...';

export interface CardAwaitingPaymentProps {
  session: CheckoutSession;
  isAwaitingCardInput: boolean;
  cardDetails: CardDetails;
  handleCardFieldChange: <TField extends keyof CardDetails>(
    field: TField,
    value: CardDetails[TField],
  ) => void;
  reviewConfirmed: boolean;
  setReviewConfirmed: (value: boolean) => void;
  submitting: boolean;
  setFormError: (message: string | null) => void;
  validateAndSubmitCard: () => void;
  resolveXenditSession: () => Promise<void>;
}

// Renders the card panel content once a card charge attempt exists (either still
// collecting input, or already submitted and awaiting the bank/PSP). Xendit's card
// input is its own embedded Components UI; Midtrans uses our CardForm + Review/Pay
// footer. Once submitted (isAwaitingCardInput false), both providers show the same
// "confirming with your bank" waiting state — the Xendit branch's condition below
// additionally requires componentsSdkKey, since the Components UI can't mount without it.
export function CardAwaitingPayment({
  session,
  isAwaitingCardInput,
  cardDetails,
  handleCardFieldChange,
  reviewConfirmed,
  setReviewConfirmed,
  submitting,
  setFormError,
  validateAndSubmitCard,
  resolveXenditSession,
}: Readonly<CardAwaitingPaymentProps>) {
  const isXendit = session.provider === PSP_PROVIDER.XENDIT;
  const attempt = session.paymentAttempt;

  if (isAwaitingCardInput && isXendit && attempt?.componentsSdkKey) {
    return (
      <>
        <XenditCardComponent
          componentsSdkKey={attempt.componentsSdkKey}
          onComplete={() => {
            void resolveXenditSession();
          }}
          onError={setFormError}
        />
        <SecureNotice
          title="Secure payment"
          subtitle="Card details are entered directly into Xendit's secure fields and never touch PayBridge."
        />
      </>
    );
  }

  if (isAwaitingCardInput) {
    return (
      <>
        <MidtransCardForm
          details={cardDetails}
          onUpdateField={handleCardFieldChange}
          hidePreview={reviewConfirmed}
        />
        <SecureNotice
          title="Secure payment"
          subtitle="Your card details are tokenized client-side directly with the gateway."
        />
        {isCardFormComplete(cardDetails) &&
          (reviewConfirmed ? (
            <PaymentFooter
              label={
                submitting
                  ? PROCESSING_LABEL
                  : `Pay ${formatCurrency(session.amount, session.currency)}`
              }
              onSubmit={validateAndSubmitCard}
            />
          ) : (
            <PaymentFooter
              label="Review Order"
              onSubmit={() => {
                setReviewConfirmed(true);
              }}
            />
          ))}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 text-center h-full max-w-xs mx-auto">
        <div className="mb-4">
          <StatusIcon variant="waiting" size={48} />
        </div>
        <p className="text-sm font-semibold text-text mb-2">Processing Card Payment</p>
        <p className="text-xs text-muted leading-relaxed">
          Confirming with your bank. Please do not close or refresh this tab.
        </p>
      </div>
      <SecureNotice
        title="Waiting for confirmation"
        subtitle="We will automatically refresh as soon as payment is confirmed."
      />
    </>
  );
}

export interface CardSelectionProps {
  session: CheckoutSession;
  cardDetails: CardDetails;
  handleCardFieldChange: <TField extends keyof CardDetails>(
    field: TField,
    value: CardDetails[TField],
  ) => void;
  reviewConfirmed: boolean;
  setReviewConfirmed: (value: boolean) => void;
  submitting: boolean;
  submitSelectedMethod: () => void;
}

export function CardSelection({
  session,
  cardDetails,
  handleCardFieldChange,
  reviewConfirmed,
  setReviewConfirmed,
  submitting,
  submitSelectedMethod,
}: Readonly<CardSelectionProps>) {
  if (session.provider === PSP_PROVIDER.XENDIT) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-xs mx-auto">
        <div className="mb-4">
          <StatusIcon variant="waiting" size={48} />
        </div>
        <p className="text-sm font-semibold text-text">Preparing secure card form...</p>
      </div>
    );
  }

  return (
    <>
      <MidtransCardForm
        details={cardDetails}
        onUpdateField={handleCardFieldChange}
        hidePreview={reviewConfirmed}
      />
      {isCardFormComplete(cardDetails) &&
        (reviewConfirmed ? (
          <PaymentFooter
            label={
              submitting
                ? PROCESSING_LABEL
                : `Pay ${formatCurrency(session.amount, session.currency)}`
            }
            onSubmit={submitSelectedMethod}
          />
        ) : (
          <PaymentFooter
            label="Review Order"
            onSubmit={() => {
              setReviewConfirmed(true);
            }}
          />
        ))}
    </>
  );
}
