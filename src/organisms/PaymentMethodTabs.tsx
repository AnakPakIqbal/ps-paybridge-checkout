import type { PaymentMethodTabId } from '../types/checkout';

import PaymentTab from '../molecules/PaymentTab';
import { PAYMENT_METHOD_TAB } from '../types/checkout';

interface TabDefinition {
  id: PaymentMethodTabId;
  label: string;
  icon: string;
}

const TAB_DESCRIPTIONS: Record<PaymentMethodTabId, string> = {
  [PAYMENT_METHOD_TAB.CARD]: 'Instant payment via Visa, Mastercard, or JCB',
  [PAYMENT_METHOD_TAB.VA]: 'Automatic verification via ATM or mobile banking',
  [PAYMENT_METHOD_TAB.EWALLET]: 'Pay instantly with QRIS or digital wallet app',
};

const defaultTabs: TabDefinition[] = [
  { id: PAYMENT_METHOD_TAB.CARD, label: 'Card', icon: '' },
  { id: PAYMENT_METHOD_TAB.VA, label: 'Virtual Account', icon: '' },
  { id: PAYMENT_METHOD_TAB.EWALLET, label: 'E-Wallet / QRIS', icon: '' },
];

interface PaymentMethodTabsProps {
  active: PaymentMethodTabId | null;
  onChange: (id: PaymentMethodTabId) => void;
  tabs?: TabDefinition[];
}

export default function PaymentMethodTabs({
  active,
  onChange,
  tabs = defaultTabs,
}: Readonly<PaymentMethodTabsProps>) {
  const hasActiveTab = active !== null;

  return (
    <div
      className={
        hasActiveTab
          ? 'flex gap-1.5 rounded-2xl border border-lineSoft bg-panel2/60 p-1.5 shadow-xs'
          : 'grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch'
      }
      id="payment-tabs"
    >
      {tabs.map((tab) => (
        <PaymentTab
          key={tab.id}
          id={tab.id}
          label={tab.label}
          description={hasActiveTab ? undefined : TAB_DESCRIPTIONS[tab.id]}
          active={active === tab.id}
          compact={hasActiveTab}
          onClick={() => {
            onChange(tab.id);
          }}
        />
      ))}
    </div>
  );
}
