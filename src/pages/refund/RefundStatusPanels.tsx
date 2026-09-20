import type { RefundSessionView } from '../../types/refund';

import StatusIcon from '../../atoms/StatusIcon';
import StatusPanel from '../../molecules/StatusPanel';
import { REFUND_STATUS } from '../../types/refund';
import { formatCurrency } from '../../utils/formatCurrency';
import { sumRefundsByStatus } from '../../utils/refundView';
import RefundSummary from './RefundSummary';

export function RefundProcessingPanel({ view }: Readonly<{ view: RefundSessionView }>) {
  const pending = sumRefundsByStatus(view.refunds, REFUND_STATUS.PENDING);
  return (
    <StatusPanel
      icon={<StatusIcon variant="waiting" />}
      iconClassName="bg-brandDim/80 border border-brand/35 shadow-brand/10"
      title="Refund in progress"
    >
      <p className="text-sm text-muted mb-6 leading-relaxed" role="status">
        Your refund is being processed. You can keep this page open — it updates by itself.
      </p>
      <RefundSummary view={view} amountLabel="Being refunded:" amount={pending} />
    </StatusPanel>
  );
}

export function RefundCompletedPanel({ view }: Readonly<{ view: RefundSessionView }>) {
  const refunded = sumRefundsByStatus(view.refunds, REFUND_STATUS.SUCCEEDED);
  return (
    <StatusPanel
      icon={<StatusIcon variant="success" />}
      iconClassName="bg-brandDim/80 border border-brand/35 shadow-brand/10"
      title="Refund successful"
    >
      <p className="text-sm text-muted mb-6 leading-relaxed">
        {formatCurrency(refunded, view.currency)} is on its way back to your original payment
        method. Depending on your bank or card issuer, it can take a few business days to appear.
        You can close this tab safely.
      </p>
      <RefundSummary view={view} amountLabel="Refunded:" amount={refunded} />
    </StatusPanel>
  );
}

export function RefundUnavailablePanel({ view }: Readonly<{ view: RefundSessionView }>) {
  return (
    <StatusPanel
      icon={<StatusIcon variant="expired" />}
      iconClassName="bg-yellow-500/10 border border-yellow-500/20 shadow-yellow-500/5"
      title="Nothing to refund"
    >
      <p className="text-sm text-muted leading-relaxed">
        There is no refundable balance left on this order. If you think this is a mistake, please
        contact {view.merchantName}.
      </p>
    </StatusPanel>
  );
}

export function RefundErrorPanel({ message }: Readonly<{ message: string }>) {
  return (
    <StatusPanel
      icon={<StatusIcon variant="failed" />}
      iconClassName="bg-red-500/10 border border-red-500/20 shadow-red-500/5"
      title="Refund unavailable"
    >
      <p className="text-sm text-muted leading-relaxed">{message}</p>
    </StatusPanel>
  );
}
