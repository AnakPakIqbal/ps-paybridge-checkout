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
    <div className="w-full bg-panel2 border border-lineSoft rounded-xl p-4 text-left text-xs text-muted space-y-2 mb-6">
      <div className="flex justify-between gap-4">
        <span>Order:</span>
        <span className="text-text text-right">{view.description}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Amount paid:</span>
        <span className="text-text">{formatCurrency(view.chargeAmount, view.currency)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>{amountLabel}</span>
        <span className="text-brand font-semibold">{formatCurrency(amount, view.currency)}</span>
      </div>
    </div>
  );
}
