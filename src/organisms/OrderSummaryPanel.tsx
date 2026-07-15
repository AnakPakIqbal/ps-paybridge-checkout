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
  const merchantName = 'Nova Studio';
  const description = 'Design subscription';
  const subtotal = amountStr;
  const fee = session ? formatCurrency(0, session.currency) : 'Rp 0';

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
        <TrustItem
          icon={icons.lock}
          title="256-bit SSL encrypted checkout"
          subtitle="Your data is protected"
        />
        <TrustItem
          icon={icons.shield}
          title="PCI DSS compliant processing"
          subtitle="Secure payment standards"
        />
        <TrustItem
          icon={icons.check}
          title="Payment details never stored"
          subtitle="We don't store your card details"
        />
      </div>
      <ComplianceStrip />
    </div>
  );
}
