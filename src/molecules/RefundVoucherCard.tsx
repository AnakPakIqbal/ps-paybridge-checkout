import type { RefundSessionView } from '../types/refund';

import { formatCurrency } from '../utils/formatCurrency';

interface RefundVoucherCardProps {
  view: RefundSessionView;
  amount: number;
  statusLabel: string;
  statusTone?: 'emerald' | 'brand' | 'amber';
}

export default function RefundVoucherCard({
  view,
  amount,
  statusLabel,
  statusTone = 'emerald',
}: Readonly<RefundVoucherCardProps>) {
  const formattedRefundAmount = formatCurrency(amount, view.currency);
  const formattedOriginalAmount = formatCurrency(view.chargeAmount, view.currency);

  const toneClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    brand: 'bg-brand/30 text-brandSoft border-brand/40',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  }[statusTone];

  return (
    <div className="w-full bg-gradient-to-br from-text via-[#0e214a] to-[#142852] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden my-5 border border-white/10">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-brand/25 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none -ml-8 -mb-8" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10 mb-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-brandSoft/80 font-semibold">
            {view.merchantName}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">Refund Voucher</h3>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${toneClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Main Refund Amount Display */}
      <div className="relative z-10 mb-5">
        <span className="text-xs text-white/60 block mb-1">Refund Total</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            {formattedRefundAmount}
          </span>
        </div>
      </div>

      {/* Breakdown Strip */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 relative z-10 text-xs">
        <div>
          <span className="text-white/50 block text-[11px]">Original Payment</span>
          <span className="font-semibold text-white mt-0.5 block">{formattedOriginalAmount}</span>
        </div>
        <div>
          <span className="text-white/50 block text-[11px]">Refund Reference</span>
          <span className="font-mono text-[11px] text-brandSoft truncate block mt-0.5">
            {view.id.slice(0, 12)}
          </span>
        </div>
      </div>
    </div>
  );
}
