import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

import type { PaymentMethodTabId } from '../types/checkout';

import StatusIcon from '../atoms/StatusIcon';
import { useCardForm } from '../hooks/useCardForm';
import { useCheckoutSession } from '../hooks/useCheckoutSession';
import { useMidtransCheckout } from '../hooks/useMidtransCheckout';
import { useXenditCheckout } from '../hooks/useXenditCheckout';
import { ExpiredView, FailedView, PaidView, SkeletonLoader } from '../molecules/StatusViews';
import OrderSummaryPanel from '../organisms/OrderSummaryPanel';
import CheckoutTemplate from '../templates/CheckoutTemplate';
import { PAYMENT_METHOD_TAB, SESSION_STATUS } from '../types/checkout';
import AwaitingPaymentPanel from './checkout/AwaitingPaymentPanel';
import MethodSelectionPanel from './checkout/MethodSelectionPanel';

export default function CheckoutPage() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [overrideSelection, setOverrideSelection] = useState(false);

  // Card input custom hook state
  const { details: cardDetails, updateField: updateCardField } = useCardForm();
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const handleCardFieldChange: typeof updateCardField = (field, value) => {
    setReviewConfirmed(false);
    updateCardField(field, value);
  };

  // VA & Ewallet selection states
  const [selectedVaMethod, setSelectedVaMethod] = useState('');
  const [selectedEwalletMethod, setSelectedEwalletMethod] = useState('');

  const [method, setMethod] = useState<PaymentMethodTabId>(PAYMENT_METHOD_TAB.CARD);

  const [hasUserSelectedMethod, setHasUserSelectedMethod] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { sessionId, token, setToken, session, setSession, loading, error, subscribeToSSE } =
    useCheckoutSession(setSelectedVaMethod, setSelectedEwalletMethod, setMethod);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    );
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      );
    }
  }, [method, session?.status]);

  const { selectPaymentMethod, resolveXenditSession } = useXenditCheckout({
    sessionId,
    token,
    session,
    method,
    hasUserSelectedMethod,
    overrideSelection,
    submitting,
    setSession,
    setToken,
    setOverrideSelection,
    setSubmitting,
    setFormError,
    subscribeToSSE,
  });

  const { submitCardPayment } = useMidtransCheckout({
    sessionId,
    token,
    session,
    setSession,
    setToken,
    setOverrideSelection,
    setSubmitting,
    setFormError,
    subscribeToSSE,
  });

  const submitSelectedMethod = () => {
    if (submitting) return;

    if (method === PAYMENT_METHOD_TAB.CARD) {
      validateAndSubmitCard();
      return;
    }

    if (method === PAYMENT_METHOD_TAB.VA) {
      if (!selectedVaMethod) {
        setFormError('Please select a bank virtual account option.');
        return;
      }
      void selectPaymentMethod(selectedVaMethod);
      return;
    }

    if (!selectedEwalletMethod) {
      setFormError('Please select an e-wallet / QRIS option.');
      return;
    }
    void selectPaymentMethod(selectedEwalletMethod);
  };

  const validateAndSubmitCard = () => {
    if (submitting) return;
    if (
      !cardDetails.number ||
      !cardDetails.firstName ||
      !cardDetails.lastName ||
      !cardDetails.expiry ||
      !cardDetails.cvv
    ) {
      setFormError('Please fill in all credit card details.');
      return;
    }
    const [expiryMonthPart, expiryYearPart] = cardDetails.expiry.split('/');
    void submitCardPayment({
      number: cardDetails.number,
      cvv: cardDetails.cvv,
      expiryMonth: expiryMonthPart?.trim() ?? '',
      expiryYear: expiryYearPart ? '20' + expiryYearPart.trim() : '',
      firstName: cardDetails.firstName,
      lastName: cardDetails.lastName,
    });
  };

  const renderRightSide = () => {
    if (loading) {
      return <SkeletonLoader />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
            <StatusIcon variant="failed" size={32} />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Checkout Error</h2>
          <p className="text-xs text-muted leading-relaxed">{error}</p>
        </div>
      );
    }

    if (!session) return null;

    // Terminal statuses
    if (session.status === SESSION_STATUS.PAID) {
      return <PaidView session={session} />;
    }
    if (session.status === SESSION_STATUS.FAILED) {
      return <FailedView />;
    }
    if (session.status === SESSION_STATUS.EXPIRED) {
      return <ExpiredView />;
    }

    // Awaiting Payment Details
    if (session.status === SESSION_STATUS.AWAITING_PAYMENT && !overrideSelection) {
      return (
        <AwaitingPaymentPanel
          session={session}
          panelRef={panelRef}
          formError={formError}
          setFormError={setFormError}
          cardDetails={cardDetails}
          handleCardFieldChange={handleCardFieldChange}
          reviewConfirmed={reviewConfirmed}
          setReviewConfirmed={setReviewConfirmed}
          submitting={submitting}
          validateAndSubmitCard={validateAndSubmitCard}
          resolveXenditSession={resolveXenditSession}
          onChangePaymentMethod={() => {
            setOverrideSelection(true);
            setHasUserSelectedMethod(false);
          }}
        />
      );
    }

    // Method selection picker (renders on initial awaiting_method_selection OR when overrideSelection is active)
    if (session.status === SESSION_STATUS.AWAITING_METHOD_SELECTION || overrideSelection) {
      return (
        <MethodSelectionPanel
          session={session}
          panelRef={panelRef}
          formError={formError}
          setFormError={setFormError}
          cardDetails={cardDetails}
          handleCardFieldChange={handleCardFieldChange}
          reviewConfirmed={reviewConfirmed}
          setReviewConfirmed={setReviewConfirmed}
          submitting={submitting}
          method={method}
          setMethod={setMethod}
          hasUserSelectedMethod={hasUserSelectedMethod}
          setHasUserSelectedMethod={setHasUserSelectedMethod}
          selectedVaMethod={selectedVaMethod}
          setSelectedVaMethod={setSelectedVaMethod}
          selectedEwalletMethod={selectedEwalletMethod}
          setSelectedEwalletMethod={setSelectedEwalletMethod}
          submitSelectedMethod={submitSelectedMethod}
        />
      );
    }

    return null;
  };

  const { number, firstName, lastName, expiry, cvv } = cardDetails;
  const hideOrderSummary =
    method === PAYMENT_METHOD_TAB.CARD &&
    Boolean(number || firstName || lastName || expiry || cvv) &&
    !reviewConfirmed;

  return (
    <div ref={cardRef}>
      <CheckoutTemplate
        left={<OrderSummaryPanel session={session} />}
        right={renderRightSide()}
        hideLeft={hideOrderSummary}
      />
    </div>
  );
}
