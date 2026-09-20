import { useId, useState } from 'react';

import type { RefundSessionView } from '../../types/refund';

import Button from '../../atoms/Button';
import NoticeBanner from '../../molecules/NoticeBanner';
import RefundTimeline from '../../molecules/RefundTimeline';
import RefundVoucherCard from '../../molecules/RefundVoucherCard';
import { formatCurrency } from '../../utils/formatCurrency';
import { latestFailedRefund } from '../../utils/refundView';
import RefundSummary from './RefundSummary';

const REASON_MAX_LENGTH = 500;

const QUICK_REASONS = [
  'Item not needed',
  'Wrong size / item',
  'Product defective',
  'Order delayed',
  'Duplicate charge',
];

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
  const asksForReason = view.reason === null;

  const handleSelectQuickReason = (selected: string) => {
    setReason(selected);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 mb-2 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Merchant Approved
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text">Confirm your refund</h1>
        <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
          <strong className="text-text">{view.merchantName}</strong> has authorized a refund for
          your order: <strong className="text-text">{view.description}</strong>.
        </p>
      </div>

      {/* Hero Refund Voucher */}
      <RefundVoucherCard
        view={view}
        amount={view.refundableAmount}
        statusLabel="Ready to Claim"
        statusTone="emerald"
      />

      {/* Refund Progress Timeline */}
      <RefundTimeline currentStep="ready" />

      {failedAttempt && (
        <div className="my-3">
          <NoticeBanner
            tone="warning"
            title="Your last attempt didn't go through"
            message={`The payment provider declined the previous refund attempt${
              failedAttempt.failureCode ? ` (code ${failedAttempt.failureCode})` : ''
            }. You can try again.`}
          />
        </div>
      )}

      {confirmError && (
        <div className="my-3">
          <NoticeBanner
            tone="error"
            title="Refund error"
            message={confirmError}
            onClose={onDismissError}
          />
        </div>
      )}

      {/* Optional Reason Selection */}
      {asksForReason && (
        <div className="flex flex-col gap-2 my-4 p-4 rounded-xl bg-panel2/50 border border-lineSoft">
          <div className="flex items-center justify-between">
            <label htmlFor={reasonId} className="text-xs font-bold text-text">
              Reason for Refund <span className="text-muted font-normal">(optional)</span>
            </label>
            <span className="text-[11px] text-muted">
              {reason.length}/{REASON_MAX_LENGTH}
            </span>
          </div>

          {/* Quick-select chips */}
          <div className="flex flex-wrap gap-1.5 mb-1">
            {QUICK_REASONS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  handleSelectQuickReason(preset);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  reason === preset
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-muted hover:text-text border-lineSoft hover:border-line'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <textarea
            id={reasonId}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
            }}
            maxLength={REASON_MAX_LENGTH}
            rows={2}
            placeholder="Specify reason or select from tags above..."
            disabled={submitting}
            className="w-full bg-white border border-lineSoft rounded-xl px-3.5 py-2.5 text-xs text-text placeholder:text-muted/60 outline-none focus:border-brand transition-colors resize-none"
          />
        </div>
      )}

      {/* Payout Destination Reassurance Box */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-muted mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-brand flex items-center justify-center font-bold shrink-0">
          ↩
        </div>
        <div>
          <span className="font-semibold text-text block">Automatic Account Settlement</span>
          <span>
            The refund will be credited directly to your original payment method. No manual bank
            entry needed.
          </span>
        </div>
      </div>

      {/* Confirmation Action Button */}
      <Button
        type="button"
        disabled={submitting}
        onClick={() => {
          onConfirm(asksForReason ? reason.trim() || undefined : undefined);
        }}
        className="w-full py-3.5 text-sm font-bold shadow-md shadow-brand/20"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing Refund…</span>
          </span>
        ) : (
          `Claim & Confirm Refund of ${formatCurrency(view.refundableAmount, view.currency)}`
        )}
      </Button>

      {/* Detailed Order Breakdown */}
      <div className="mt-5 pt-4 border-t border-lineSoft">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Order Summary & Amount Breakdown
        </h4>
        <RefundSummary view={view} amountLabel="Refund amount:" amount={view.refundableAmount} />
      </div>

      <p className="text-[11px] text-muted text-center mt-2 leading-relaxed">
        How long it takes to show up depends on your bank or card issuer.
      </p>
    </div>
  );
}
