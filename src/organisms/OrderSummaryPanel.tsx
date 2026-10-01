import type { CheckoutSession } from '../types/checkout';

import AmountDisplay from '../molecules/AmountDisplay';
import ComplianceStrip from '../molecules/ComplianceStrip';
import MerchantSummary from '../molecules/MerchantSummary';
import { formatCurrency } from '../utils/formatCurrency';

interface OrderSummaryPanelProps {
  session: CheckoutSession | null;
}

export default function OrderSummaryPanel({ session }: Readonly<OrderSummaryPanelProps>) {
  const amountStr = session ? formatCurrency(session.amount, session.currency) : 'Rp 0';
  const description = session?.description ?? 'Checkout Order';
  const subtotal = amountStr;
  const fee = session ? formatCurrency(0, session.currency) : 'Rp 0';
  const merchantName = session?.merchant?.name ?? 'Merchant';
  const merchantInitial = merchantName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Merchant Trust Profile Card */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brandSoft/60 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {merchantInitial}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-text">{merchantName}</h3>
                <span
                  title="Verified Merchant"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand text-white text-[10px]"
                >
                  ✓
                </span>
              </div>
              <p className="text-sm text-muted">Verified Merchant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary Card */}
      <div>
        <AmountDisplay amount={amountStr} />
        <div className="mt-5">
          <MerchantSummary
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
        </div>
      </div>

      <ComplianceStrip />
    </div>
  );
}
