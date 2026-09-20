import type { RefundSessionView } from '../../types/refund';

import { formatCurrency } from '../../utils/formatCurrency';

interface RefundSummaryProps {
  view: RefundSessionView;
  // The refund amount row, whose meaning depends on the panel: "to be refunded" while
  // ready, "being refunded" while processing, "refunded" once completed.
  amountLabel: string;
  amount: number;
}

export default function RefundSummary({ view, amountLabel, amount }: Readonly<RefundSummaryProps>) {
  return (
    <div className="w-full bg-panel2/60 border border-lineSoft rounded-xl p-4 text-left text-xs text-muted space-y-2.5 my-2">
      <div className="flex justify-between items-center gap-4 py-0.5 border-b border-lineSoft/50">
        <span className="font-medium text-muted">Order Description:</span>
        <span className="text-text text-right font-semibold truncate max-w-[200px] sm:max-w-xs">
          {view.description}
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 py-0.5 border-b border-lineSoft/50">
        <span className="font-medium text-muted">Original Charge:</span>
        <span className="text-text font-medium">
          {formatCurrency(view.chargeAmount, view.currency)}
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 py-0.5">
        <span className="font-semibold text-text">{amountLabel}</span>
        <span className="text-brand font-bold text-sm tracking-tight">
          {formatCurrency(amount, view.currency)}
        </span>
      </div>
    </div>
  );
}
