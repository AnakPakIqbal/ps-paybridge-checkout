import BrandMark from '../molecules/BrandMark.jsx'
import AmountDisplay from '../molecules/AmountDisplay.jsx'
import MerchantSummary from '../molecules/MerchantSummary.jsx'
import TrustItem from '../molecules/TrustItem.jsx'
import ComplianceStrip from '../molecules/ComplianceStrip.jsx'
import { icons } from '../atoms/Icon.jsx'

export function formatCurrency(amount, currency = 'IDR') {
  if (currency === 'IDR') {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export default function OrderSummaryPanel({ session }) {
  const amountStr = session ? formatCurrency(session.amount, session.currency) : 'Rp 0'
  const reference = session ? session.orderId : '...'
  const merchantName = 'Nova Studio'
  const description = 'Design subscription'
  const subtotal = amountStr
  const fee = session ? formatCurrency(0, session.currency) : 'Rp 0'

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <BrandMark />
      <AmountDisplay amount={amountStr} reference={reference} />
      <MerchantSummary
        merchant={merchantName}
        description={description}
        subtotal={subtotal}
        fee={fee}
        total={amountStr}
      />
      <div className="flex flex-col flex-1">
        <TrustItem icon={icons.lock} title="256-bit SSL encrypted checkout" subtitle="Your data is protected" />
        <TrustItem icon={icons.shield} title="PCI DSS compliant processing" subtitle="Secure payment standards" />
        <TrustItem icon={icons.check} title="Payment details never stored" subtitle="We don't store your card details" />
      </div>
      <ComplianceStrip />
    </div>
  )
}
