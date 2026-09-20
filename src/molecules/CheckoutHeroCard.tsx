import type { CheckoutSession } from '../types/checkout';

import { formatCurrency } from '../utils/formatCurrency';

interface CheckoutHeroCardProps {
  session: CheckoutSession;
  statusLabel?: string;
  statusTone?: 'emerald' | 'amber' | 'brand';
}

export default function CheckoutHeroCard({
  session,
  statusLabel = 'SECURE CHECKOUT',
  statusTone = 'emerald',
}: Readonly<CheckoutHeroCardProps>) {
  const formattedAmount = formatCurrency(session.amount, session.currency);
  const merchantName = session.merchant?.name ?? 'Merchant';

  const toneClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    brand: 'bg-brand/30 text-brandSoft border-brand/40',
  }[statusTone];

  return (
    <div className="w-full bg-gradient-to-br from-text via-[#0e214a] to-[#122b60] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden mb-6 border border-white/10">
      {/* Decorative ambient lighting elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand/20 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -ml-8 -mb-8" />

      {/* Card Top Row */}
      <div className="flex items-center justify-between relative z-10 mb-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-brandSoft/80 font-semibold block">
            {merchantName}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[280px] sm:max-w-md">
            {session.description ?? 'Order Payment'}
          </h3>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${toneClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Main Total Amount Due */}
      <div className="relative z-10 mb-5">
        <span className="text-xs text-white/60 block mb-1">Total Payment Due</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            {formattedAmount}
          </span>
          <span className="text-xs text-emerald-300 font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            0% Processing Fee
          </span>
        </div>
      </div>

      {/* Quick Details Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 relative z-10 text-xs">
        <div>
          <span className="text-white/50 block text-[11px]">Order Reference</span>
          <span className="font-mono text-[11px] text-brandSoft truncate block mt-0.5">
            {session.orderId}
          </span>
        </div>
        <div>
          <span className="text-white/50 block text-[11px]">Payment Method</span>
          <span className="font-medium text-white block mt-0.5">Customer Choice</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-white/50 block text-[11px]">Security</span>
          <span className="text-emerald-300 font-medium block mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            256-Bit SSL Vault
          </span>
        </div>
      </div>
    </div>
  );
}
