import { useId, useState } from 'react';

import type { RefundSessionView } from '../../types/refund';

import Button from '../../atoms/Button';
import NoticeBanner from '../../molecules/NoticeBanner';
import { formatCurrency } from '../../utils/formatCurrency';
import { latestFailedRefund } from '../../utils/refundView';
import RefundSummary from './RefundSummary';

// Matches REFUND_REASON_MAX_LENGTH on the server, which rejects anything longer.
const REASON_MAX_LENGTH = 500;

interface RefundReadyPanelProps {
  view: RefundSessionView;
  submitting: boolean;
  confirmError: string | null;
  onConfirm: (reason?: string) => void;
  onDismissError: () => void;
}

export default function RefundReadyPanel({
  view,
  submitting,
  confirmError,
  onConfirm,
  onDismissError,
}: Readonly<RefundReadyPanelProps>) {
  const [reason, setReason] = useState('');
  const reasonId = useId();
  const failedAttempt = latestFailedRefund(view);
  // The merchant may have fixed the reason already; only ask when they did not.
  const asksForReason = view.reason === null;

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold text-text mb-1">Confirm your refund</h1>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        {view.merchantName} has approved a refund for your order.
      </p>

      <RefundSummary view={view} amountLabel="Refund amount:" amount={view.refundableAmount} />

      {failedAttempt && (
        <NoticeBanner
          tone="warning"
          title="Your last attempt didn't go through"
          message={`The payment provider declined the previous refund attempt${
            failedAttempt.failureCode ? ` (code ${failedAttempt.failureCode})` : ''
          }. You can try again.`}
        />
      )}

      {confirmError && (
        <NoticeBanner
          tone="error"
          title="Refund error"
          message={confirmError}
          onClose={onDismissError}
        />
      )}

      {asksForReason && (
        <div className="flex flex-col gap-2 mb-6">
          <label htmlFor={reasonId} className="text-sm text-text">
            Reason for the refund <span className="text-muted">(optional)</span>
          </label>
          <textarea
            id={reasonId}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
            }}
            maxLength={REASON_MAX_LENGTH}
            rows={3}
            placeholder="For example: wrong size, item not needed"
            disabled={submitting}
            className="w-full bg-panel2 border border-transparent rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/60 outline-none transition-colors duration-150 resize-none"
          />
        </div>
      )}

      <Button
        type="button"
        disabled={submitting}
        onClick={() => {
          onConfirm(asksForReason ? reason.trim() || undefined : undefined);
        }}
      >
        {submitting
          ? 'Submitting…'
          : `Confirm refund of ${formatCurrency(view.refundableAmount, view.currency)}`}
      </Button>

      <p className="text-xs text-muted text-center mt-4 leading-relaxed">
        The refund goes back to your original payment method. Depending on your bank or card issuer,
        it can take a few business days to appear.
      </p>
    </div>
  );
}
