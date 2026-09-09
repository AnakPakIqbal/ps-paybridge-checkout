import type { PaymentMethodTabId } from '../types/checkout';

import { icons } from '../atoms/icons';
import PaymentMethodIntro from '../molecules/PaymentMethodIntro';
import PaymentTab from '../molecules/PaymentTab';
import { PAYMENT_METHOD_TAB } from '../types/checkout';

interface TabDefinition {
  id: PaymentMethodTabId;
  label: string;
  icon: string;
}

const TAB_DESCRIPTIONS: Record<PaymentMethodTabId, string> = {
  [PAYMENT_METHOD_TAB.VA]: 'Pay via bank transfer using Virtual Account',
  [PAYMENT_METHOD_TAB.EWALLET]: 'Pay easily using your favorite e-wallet',
  [PAYMENT_METHOD_TAB.CARD]: 'Pay securely using debit or credit card',
};

const defaultTabs: TabDefinition[] = [
  { id: PAYMENT_METHOD_TAB.CARD, label: 'Card', icon: icons.card },
  { id: PAYMENT_METHOD_TAB.VA, label: 'Virtual Account', icon: icons.bank },
  { id: PAYMENT_METHOD_TAB.EWALLET, label: 'E-Wallet', icon: icons.wallet },
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
    <div>
      {!hasActiveTab && <PaymentMethodIntro />}
      {/* The expanded cards carry a description and get squeezed into unreadable
          two-word-per-line columns on a phone, so they stack until there is room.
          The compact tabs are short icon+label pills and stay in a row. */}
      <div
        className={`flex gap-3 ${hasActiveTab ? '' : 'flex-col sm:flex-row'}`}
        id="payment-tabs"
      >
        {tabs.map((tab) => (
          <PaymentTab
            key={tab.id}
            icon={tab.icon}
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
    </div>
  );
}
