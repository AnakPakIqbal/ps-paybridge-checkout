import type { OrderItem } from '../types/checkout';

import { formatCurrency } from '../utils/formatCurrency';

interface MerchantSummaryProps {
  merchant?: string | undefined;
  description?: string | undefined;
  customerName?: string | undefined;
  customerEmail?: string | undefined;
  customerMobileNumber?: string | undefined;
  items?: OrderItem[] | undefined;
  currency?: string | undefined;
  subtotal: string;
  fee: string;
  total: string;
}

export default function MerchantSummary({
  merchant,
  description,
  customerName,
  customerEmail,
  customerMobileNumber,
  items,
  currency = 'IDR',
  subtotal,
  fee,
  total,
}: Readonly<MerchantSummaryProps>) {
  const hasCustomerDetails = Boolean(customerName ?? customerEmail ?? customerMobileNumber);
  const hasItems = Boolean(items && items.length > 0);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Merchant Details */}
      {merchant && (
        <div className="flex items-center justify-between pb-2.5 border-b border-lineSoft/60 text-xs">
          <span className="text-muted font-medium">Merchant</span>
          <span className="text-text font-semibold flex items-center gap-1.5">
            {merchant}
            <span
              title="Verified Merchant"
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-brand text-white text-[9px]"
            >
              ✓
            </span>
          </span>
        </div>
      )}

      {/* Order Items Breakdown - Clean, open receipt styling without nested boxes */}
      {hasItems && items ? (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted pb-1">
            Order Items ({items.length})
          </div>
          <div className="divide-y divide-lineSoft/40">
            {items.map((item) => (
              <div
                key={`${item.name}-${item.price}-${item.quantity}`}
                className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="font-bold text-text text-xs shrink-0 tabular-nums">
                    {item.quantity}×
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-[11px] text-muted leading-tight mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-text tabular-nums text-right shrink-0">
                  {formatCurrency(item.price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        description && (
          <div className="py-2 text-xs flex justify-between items-center border-b border-lineSoft/50">
            <span className="text-muted text-[11px]">Description</span>
            <span className="text-text font-medium">{description}</span>
          </div>
        )
      )}

      {/* Customer Details - Clean key-value pairs without clunky borders */}
      {hasCustomerDetails && (
        <div className="pt-3 border-t border-lineSoft/60 space-y-1.5 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
            Customer Details
          </div>
          {customerName && (
            <div className="flex items-center justify-between">
              <span className="text-muted text-[11px]">Name</span>
              <span className="text-text font-medium">{customerName}</span>
            </div>
          )}
          {customerEmail && (
            <div className="flex items-center justify-between">
              <span className="text-muted text-[11px]">Email</span>
              <span className="text-text font-medium truncate max-w-[200px]">{customerEmail}</span>
            </div>
          )}
          {customerMobileNumber && (
            <div className="flex items-center justify-between">
              <span className="text-muted text-[11px]">Mobile</span>
              <span className="text-text font-medium">{customerMobileNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* Financial Calculations */}
      <div className="pt-3 border-t border-lineSoft/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted">
          <span>Subtotal</span>
          <span className="text-text font-medium tabular-nums">{subtotal}</span>
        </div>
        <div className="flex items-center justify-between text-muted">
          <span>Processing Fee</span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Free
            </span>
            <span className="text-text font-medium tabular-nums">{fee}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-lineSoft flex items-center justify-between">
          <span className="font-bold text-sm text-text">Total</span>
          <span className="font-extrabold text-lg sm:text-xl text-brand tabular-nums">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}
