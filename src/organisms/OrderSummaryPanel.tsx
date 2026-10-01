import type { CheckoutSession } from '../types/checkout';

import paybridgeLogo from '../assets/images/paybridge-logo.png';
import AmountDisplay from '../molecules/AmountDisplay';
import CollapsibleDetails from '../molecules/CollapsibleDetails';
import ComplianceStrip from '../molecules/ComplianceStrip';
import MerchantSummary from '../molecules/MerchantSummary';
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
              <p className="text-xs text-muted">Verified Merchant</p>
            </div>
          </div>
          <img
            src={paybridgeLogo}
            alt="PayBridge"
            className="h-9 w-auto bg-white rounded-md p-1 border border-lineSoft shadow-2xs"
          />
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-panel border border-lineSoft rounded-2xl p-5 shadow-xs">
        <AmountDisplay amount={amountStr} />
        <CollapsibleDetails title="Details" className="mt-3">
          <div className="space-y-2.5 pb-3 border-b border-lineSoft/80 text-xs">
            <div className="flex items-center justify-between text-muted">
              <span>Portal Type</span>
              <span className="text-text font-medium">Secure Checkout</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>Reference</span>
              <span className="text-text font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-lineSoft truncate max-w-[170px]">
                {reference}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>Payment Security</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Tokenized Vault (PCI-DSS)
              </span>
            </div>
          </div>
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
        </CollapsibleDetails>
      </div>

      <ComplianceStrip />
    </div>
  );
}
