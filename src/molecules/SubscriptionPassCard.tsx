import type { SubscriptionSessionView } from '../types/subscription';

import { formatCurrency } from '../utils/formatCurrency';
import {
  formatBillingDate,
  formatBillingInterval,
  formatTotalRecurrence,
} from '../utils/formatSubscription';

interface SubscriptionPassCardProps {
  view: SubscriptionSessionView;
  nextDate: string | null;
}

export default function SubscriptionPassCard({
  view,
  nextDate,
}: Readonly<SubscriptionPassCardProps>) {
  const { plan } = view;
  const length = formatTotalRecurrence(plan.totalRecurrence);
  const formattedPrice = formatCurrency(plan.amount, plan.currency);
  const formattedInterval = formatBillingInterval(plan.interval, plan.intervalCount);

  return (
    <div className="w-full bg-gradient-to-br from-text via-[#0e214a] to-[#122b60] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden my-6 border border-white/10">
      {/* Decorative pass styling elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand/20 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -ml-8 -mb-8" />

      {/* Pass Header */}
      <div className="flex items-center justify-between relative z-10 mb-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-brandSoft/80 font-semibold">
            {view.merchantName}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {plan.description ?? 'Subscription Membership'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ACTIVE</span>
        </div>
      </div>

      {/* Main Price Tag */}
      <div className="relative z-10 mb-6">
        <div className="text-xs text-white/60 mb-1">Billing Amount</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
            {formattedPrice}
          </span>
          <span className="text-xs text-brandSoft/90 font-medium px-2 py-0.5 rounded-full bg-white/10">
            {formattedInterval}
          </span>
        </div>
      </div>

      {/* Pass Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 relative z-10 text-xs">
        <div>
          <span className="text-white/50 block text-[11px]">Next Renewal</span>
          <span className="font-semibold text-white mt-0.5 block">
            {nextDate ? formatBillingDate(nextDate) : 'Not scheduled'}
          </span>
        </div>
        <div>
          <span className="text-white/50 block text-[11px]">Commitment</span>
          <span className="font-semibold text-white mt-0.5 block">
            {length ?? 'Cancel anytime'}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-white/50 block text-[11px]">Subscription ID</span>
          <span className="font-mono text-[11px] text-brandSoft truncate block mt-0.5">
            {(view.subscription?.id ?? view.id).slice(0, 12)}
          </span>
        </div>
      </div>
    </div>
  );
}
