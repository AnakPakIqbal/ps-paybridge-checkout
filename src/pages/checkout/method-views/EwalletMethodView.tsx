import type { CheckoutSession, PaymentAttempt } from '../../../types/checkout';

import EwalletForm from '../../../organisms/EwalletForm';
import PaymentFooter from '../../../organisms/PaymentFooter';

const PROCESSING_LABEL = 'Processing...';

export interface EwalletAwaitingPaymentProps {
  attempt: PaymentAttempt;
  amount?: number | undefined;
  currency?: string | undefined;
}

export function EwalletAwaitingPayment({
  attempt,
  amount,
  currency,
}: Readonly<EwalletAwaitingPaymentProps>) {
  return <EwalletForm paymentAttempt={attempt} amount={amount} currency={currency} />;
}

export interface EwalletSelectionProps {
  session: CheckoutSession;
  selectedEwalletMethod: string;
  setSelectedEwalletMethod: (code: string) => void;
  submitting: boolean;
  submitSelectedMethod: () => void;
}

export function EwalletSelection({
  session,
  selectedEwalletMethod,
  setSelectedEwalletMethod,
  submitting,
  submitSelectedMethod,
}: Readonly<EwalletSelectionProps>) {
  return (
    <>
      <EwalletForm
        availableMethods={session.availableMethods ?? []}
        selectedMethod={selectedEwalletMethod}
        setSelectedMethod={setSelectedEwalletMethod}
      />
      <PaymentFooter
        label={submitting ? PROCESSING_LABEL : 'Continue to Wallet'}
        onSubmit={submitSelectedMethod}
      />
    </>
  );
}
