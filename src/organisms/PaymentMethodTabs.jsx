import PaymentTab from '../molecules/PaymentTab.jsx'
import Icon, { icons } from '../atoms/Icon.jsx'

const defaultTabs = [
  { id: 'card', label: 'Card', icon: icons.card },
  { id: 'va', label: 'Virtual Account', icon: icons.bank },
  { id: 'ewallet', label: 'E-Wallet', icon: icons.wallet }
]

export default function PaymentMethodTabs({ active, onChange, tabs = defaultTabs }) {
  return (
    <div>
      <h1 className="text-base font-semibold text-text mb-4">Choose payment method</h1>
      <div className="flex gap-3" id="payment-tabs">
        {tabs.map(tab => (
          <PaymentTab
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={active === tab.id}
            onClick={() => onChange(tab.id)}
          />
        ))}
      </div>
    </div>
  )
}

export { Icon }
