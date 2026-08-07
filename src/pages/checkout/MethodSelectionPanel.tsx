import type { RefObject } from 'react';

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
    title: 'Secure payment',
    subtitle: 'You will enter card details tokenized securely directly with the provider.',
  },
  [PAYMENT_METHOD_TAB.VA]: {
    title: 'Bank transfer',
    subtitle: 'Select a bank to generate your unique virtual account details.',
  },
  [PAYMENT_METHOD_TAB.EWALLET]: {
    title: 'E-Wallet checkout',
    subtitle: "You will be redirected to the provider's payment page or scan a QR code.",
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
  if (hasVa) tabs.push({ id: PAYMENT_METHOD_TAB.VA, label: 'Virtual Account', icon: icons.bank });
  if (hasEwallet)
    tabs.push({ id: PAYMENT_METHOD_TAB.EWALLET, label: 'E-Wallet', icon: icons.wallet });
  if (hasCard) tabs.push({ id: PAYMENT_METHOD_TAB.CARD, label: 'Card', icon: icons.card });
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

// Dispatches to the Card/VA/E-wallet selection view for whichever tab is active — see
// CardMethodView/VaMethodView/EwalletMethodView for each method's own rendering.
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

  return (
    <div
      className={`flex flex-col gap-5 ${
        hasUserSelectedMethod && method === PAYMENT_METHOD_TAB.CARD ? '' : 'h-full'
      } ${hasUserSelectedMethod ? '' : 'items-center justify-center max-w-md mx-auto w-full'}`}
    >
      {tabs.length > 0 && (
        <div className="w-full">
          <PaymentMethodTabs
            active={hasUserSelectedMethod ? method : null}
            onChange={(nextMethod) => {
              setHasUserSelectedMethod(true);
              setMethod(nextMethod);
            }}
            tabs={tabs}
          />
        </div>
      )}

      {hasUserSelectedMethod && (
        <div className="w-full flex flex-col gap-5">
          <ErrorBanner
            message={formError}
            onClose={() => {
              setFormError(null);
            }}
          />

          <div
            ref={panelRef}
            className={`rounded-xl2 border border-lineSoft bg-panel2/30 p-6 ${
              method === PAYMENT_METHOD_TAB.CARD ? '' : 'flex-1'
            }`}
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
      )}
    </div>
  );
}
