import type { CheckoutSession } from '../types/checkout';

import { icons } from '../atoms/icons';
import AmountDisplay from '../molecules/AmountDisplay';
import BrandMark from '../molecules/BrandMark';
import ComplianceStrip from '../molecules/ComplianceStrip';
import MerchantSummary from '../molecules/MerchantSummary';
import TrustItem from '../molecules/TrustItem';
import { formatCurrency } from '../utils/formatCurrency';

interface OrderSummaryPanelProps {
  session: CheckoutSession | null;
}

export default function OrderSummaryPanel({ session }: Readonly<OrderSummaryPanelProps>) {
  const amountStr = session ? formatCurrency(session.amount, session.currency) : 'Rp 0';
  const reference = session ? session.orderId : '...';
  const description = session?.description ?? 'Checkout Order';
  const subtotal = amountStr;
  const fee = session ? formatCurrency(0, session.currency) : 'Rp 0';

  return (
    <div className="flex flex-col h-full px-6 py-4 md:overflow-y-auto">
      <BrandMark />
      <AmountDisplay amount={amountStr} reference={reference} />
      <MerchantSummary
        merchant={session?.merchant?.name}
        description={description}
        customerName={session?.customerName}
        customerEmail={session?.customerEmail}
        customerMobileNumber={session?.customerMobileNumber}
        items={session?.items}
        currency={session?.currency}
        subtotal={subtotal}
        fee={fee}
        total={amountStr}
      />
      <div className="flex-1" />
      <TrustItem
        icon={icons.lock}
        title="Payment details never stored"
        subtitle="256-bit SSL encrypted, PCI DSS compliant"
      />
      <ComplianceStrip />
    </div>
  );
}
