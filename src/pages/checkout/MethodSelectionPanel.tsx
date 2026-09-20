import type { RefObject } from 'react';

import { ShieldCheck } from 'lucide-react';

import type { CardDetails } from '../../hooks/useCardForm';
import type { CheckoutSession, PaymentMethodTabId } from '../../types/checkout';

import { icons } from '../../atoms/icons';
import SecureNotice from '../../molecules/SecureNotice';
import { ErrorBanner } from '../../molecules/StatusViews';
import PaymentMethodTabs from '../../organisms/PaymentMethodTabs';
import { PAYMENT_METHOD_CATEGORY, PAYMENT_METHOD_TAB } from '../../types/checkout';
import { CardSelection } from './method-views/CardMethodView';
import { EwalletSelection } from './method-views/EwalletMethodView';
import { VaSelection } from './method-views/VaMethodView';

const NOTICES: Record<PaymentMethodTabId, { title: string; subtitle: string }> = {
  [PAYMENT_METHOD_TAB.CARD]: {
    title: 'Secure Card Payment',
    subtitle: 'Card details are tokenized securely directly with the payment provider.',
  },
  [PAYMENT_METHOD_TAB.VA]: {
    title: 'Virtual Account Transfer',
    subtitle: 'Generate a unique virtual account number to pay via ATM or mobile banking.',
  },
  [PAYMENT_METHOD_TAB.EWALLET]: {
    title: 'E-Wallet & QRIS Checkout',
    subtitle: 'Pay instantly by scanning the QR code or confirming in your e-wallet app.',
  },
};

interface TabDefinition {
  id: PaymentMethodTabId;
  label: string;
  icon: string;
}

function deriveAvailableTabs(
  availableMethods: CheckoutSession['availableMethods'],
): TabDefinition[] {
  const availableCategories = new Set(availableMethods?.map((option) => option.category));
  const hasCard = availableCategories.has(PAYMENT_METHOD_CATEGORY.CARD);
  const hasVa = availableCategories.has(PAYMENT_METHOD_CATEGORY.VIRTUAL_ACCOUNT);
  const hasEwallet =
    availableCategories.has(PAYMENT_METHOD_CATEGORY.E_WALLET) ||
    availableCategories.has(PAYMENT_METHOD_CATEGORY.QR_CODE);

  const tabs: TabDefinition[] = [];
  if (hasCard) tabs.push({ id: PAYMENT_METHOD_TAB.CARD, label: 'Card', icon: icons.card });
  if (hasVa) tabs.push({ id: PAYMENT_METHOD_TAB.VA, label: 'Virtual Account', icon: icons.bank });
  if (hasEwallet)
    tabs.push({ id: PAYMENT_METHOD_TAB.EWALLET, label: 'E-Wallet / QRIS', icon: icons.wallet });
  return tabs;
}

export interface MethodSelectionPanelProps {
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
  method: PaymentMethodTabId;
  setMethod: (method: PaymentMethodTabId) => void;
  hasUserSelectedMethod: boolean;
  setHasUserSelectedMethod: (value: boolean) => void;
  selectedVaMethod: string;
  setSelectedVaMethod: (code: string) => void;
  selectedEwalletMethod: string;
  setSelectedEwalletMethod: (code: string) => void;
  submitSelectedMethod: () => void;
}

export default function MethodSelectionPanel({
  session,
  panelRef,
  formError,
  setFormError,
  cardDetails,
  handleCardFieldChange,
  reviewConfirmed,
  setReviewConfirmed,
  submitting,
  method,
  setMethod,
  hasUserSelectedMethod,
  setHasUserSelectedMethod,
  selectedVaMethod,
  setSelectedVaMethod,
  selectedEwalletMethod,
  setSelectedEwalletMethod,
  submitSelectedMethod,
}: Readonly<MethodSelectionPanelProps>) {
  const tabs = deriveAvailableTabs(session.availableMethods);
  const merchantName = session.merchant?.name ?? 'Merchant';

  return (
    <div className="flex flex-col">
      {/* Checkout Section Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brandDim text-xs font-semibold text-brand mb-2 border border-brand/20">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          Checkout Order
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text">Choose payment method</h1>
        <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
          Select your preferred payment channel to complete your order with{' '}
          <strong className="text-text">{merchantName.trim()}</strong>.
        </p>
      </div>

      {/* Payment Method Selector */}
      <div className="my-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Available Payment Channels
        </h2>
        {tabs.length > 0 && (
          <PaymentMethodTabs
            active={hasUserSelectedMethod ? method : null}
            onChange={(nextMethod) => {
              setHasUserSelectedMethod(true);
              setMethod(nextMethod);
            }}
            tabs={tabs}
          />
        )}
      </div>

      {/* Active Method Form Container */}
      {hasUserSelectedMethod ? (
        <div className="w-full flex flex-col gap-4 mt-3">
          <ErrorBanner
            message={formError}
            onClose={() => {
              setFormError(null);
            }}
          />

          <div
            ref={panelRef}
            className="rounded-2xl border border-lineSoft bg-panel2/40 p-6 flex flex-col gap-5 shadow-xs"
          >
            {method === PAYMENT_METHOD_TAB.CARD && (
              <CardSelection
                session={session}
                cardDetails={cardDetails}
                handleCardFieldChange={handleCardFieldChange}
                reviewConfirmed={reviewConfirmed}
                setReviewConfirmed={setReviewConfirmed}
                submitting={submitting}
                submitSelectedMethod={submitSelectedMethod}
              />
            )}
            {method === PAYMENT_METHOD_TAB.VA && (
              <VaSelection
                session={session}
                selectedVaMethod={selectedVaMethod}
                setSelectedVaMethod={setSelectedVaMethod}
                submitting={submitting}
                submitSelectedMethod={submitSelectedMethod}
              />
            )}
            {method === PAYMENT_METHOD_TAB.EWALLET && (
              <EwalletSelection
                session={session}
                selectedEwalletMethod={selectedEwalletMethod}
                setSelectedEwalletMethod={setSelectedEwalletMethod}
                submitting={submitting}
                submitSelectedMethod={submitSelectedMethod}
              />
            )}
          </div>

          <SecureNotice {...NOTICES[method]} />
        </div>
      ) : (
        <div className="rounded-2xl border border-lineSoft bg-panel2/30 p-8 text-center flex flex-col items-center justify-center my-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-brandDim flex items-center justify-center text-brand mb-3 shadow-xs border border-brand/15">
            <ShieldCheck size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-text text-sm mb-1">Select a payment channel above</h3>
          <p className="text-xs text-muted max-w-sm leading-relaxed mb-4">
            Click Credit Card, Virtual Account, or E-Wallet to enter payment details. All
            transactions are protected with 256-bit SSL encryption.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted font-medium">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-lineSoft shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              PCI-DSS Level 1
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-lineSoft shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Direct Provider Tokenization
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-lineSoft shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              3-D Secure
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
