import type { PaymentMethodTabId } from '../types/checkout';

import { icons } from '../atoms/icons';
import PaymentTab from '../molecules/PaymentTab';
import { PAYMENT_METHOD_TAB } from '../types/checkout';

interface TabDefinition {
  id: PaymentMethodTabId;
  label: string;
  icon: string;
}

const defaultTabs: TabDefinition[] = [
  { id: PAYMENT_METHOD_TAB.CARD, label: 'Card', icon: icons.card },
  { id: PAYMENT_METHOD_TAB.VA, label: 'Virtual Account', icon: icons.bank },
  { id: PAYMENT_METHOD_TAB.EWALLET, label: 'E-Wallet', icon: icons.wallet },
];

interface PaymentMethodTabsProps {
  active: PaymentMethodTabId;
  onChange: (id: PaymentMethodTabId) => void;
  tabs?: TabDefinition[];
}

export default function PaymentMethodTabs({
  active,
  onChange,
  tabs = defaultTabs,
}: Readonly<PaymentMethodTabsProps>) {
  return (
    <div>
      <h1 className="text-base font-semibold text-text mb-4">Choose payment method</h1>
      <div className="flex gap-3" id="payment-tabs">
        {tabs.map((tab) => (
          <PaymentTab
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={active === tab.id}
            onClick={() => {
              onChange(tab.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
