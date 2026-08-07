import type { CheckoutSession, PaymentAttempt } from '../../../types/checkout';

import PaymentFooter from '../../../organisms/PaymentFooter';
import VirtualAccountForm from '../../../organisms/VirtualAccountForm';

const PROCESSING_LABEL = 'Processing...';

export interface VaAwaitingPaymentProps {
  attempt: PaymentAttempt;
}

export function VaAwaitingPayment({ attempt }: Readonly<VaAwaitingPaymentProps>) {
  return <VirtualAccountForm paymentAttempt={attempt} />;
}

export interface VaSelectionProps {
  session: CheckoutSession;
  selectedVaMethod: string;
  setSelectedVaMethod: (code: string) => void;
  submitting: boolean;
  submitSelectedMethod: () => void;
}

export function VaSelection({
  session,
  selectedVaMethod,
  setSelectedVaMethod,
  submitting,
  submitSelectedMethod,
}: Readonly<VaSelectionProps>) {
  return (
    <>
      <VirtualAccountForm
        availableMethods={session.availableMethods ?? []}
        selectedMethod={selectedVaMethod}
        setSelectedMethod={setSelectedVaMethod}
      />
      <PaymentFooter
        label={submitting ? PROCESSING_LABEL : 'Confirm Selected Bank'}
        onSubmit={submitSelectedMethod}
      />
    </>
  );
}
