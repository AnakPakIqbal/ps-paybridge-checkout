import type { RefundSessionView } from '../../types/refund';

import StatusIcon from '../../atoms/StatusIcon';
import ReceiptActionBar from '../../molecules/ReceiptActionBar';
import RefundTimeline from '../../molecules/RefundTimeline';
import RefundVoucherCard from '../../molecules/RefundVoucherCard';
import StatusPanel from '../../molecules/StatusPanel';
import { REFUND_STATUS } from '../../types/refund';
import { formatCurrency } from '../../utils/formatCurrency';
import { sumRefundsByStatus } from '../../utils/refundView';
import RefundSummary from './RefundSummary';

const BRAND_ICON = 'bg-brandDim/80 border border-brand/35 shadow-brand/10';

export function RefundProcessingPanel({ view }: Readonly<{ view: RefundSessionView }>) {
  const pending = sumRefundsByStatus(view.refunds, REFUND_STATUS.PENDING);
  const amountToDisplay = pending > 0 ? pending : view.refundableAmount;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-lineSoft">
        <div
          className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${BRAND_ICON}`}
        >
          <StatusIcon variant="waiting" size={36} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text">Refund in progress</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Processing
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5 leading-relaxed">
            Your refund is transmitting to the payment provider. This page updates automatically.
          </p>
        </div>
      </div>

      {/* Hero Refund Voucher */}
      <RefundVoucherCard
        view={view}
        amount={amountToDisplay}
        statusLabel="Processing"
        statusTone="amber"
      />

      {/* 3-Step Timeline */}
      <RefundTimeline currentStep="processing" />

      {/* Detailed Order Breakdown */}
      <div className="mt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Refund Summary
        </h4>
        <RefundSummary view={view} amountLabel="Being refunded:" amount={amountToDisplay} />
      </div>

      {/* Action Bar */}
      <ReceiptActionBar referenceId={view.id} />
    </div>
  );
}

export function RefundCompletedPanel({ view }: Readonly<{ view: RefundSessionView }>) {
  const refunded = sumRefundsByStatus(view.refunds, REFUND_STATUS.SUCCEEDED);
  const amountToDisplay = refunded > 0 ? refunded : view.refundableAmount;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-lineSoft">
        <div
          className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${BRAND_ICON}`}
        >
          <StatusIcon variant="success" size={36} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text">Refund successful</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Completed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5 leading-relaxed">
            {formatCurrency(amountToDisplay, view.currency)} has been issued back to your original
            payment source.
          </p>
        </div>
      </div>

      {/* Hero Refund Voucher */}
      <RefundVoucherCard
        view={view}
        amount={amountToDisplay}
        statusLabel="Refund Succeeded"
        statusTone="emerald"
      />

      {/* 3-Step Timeline */}
      <RefundTimeline currentStep="completed" />

      {/* Detailed Order Breakdown */}
      <div className="mt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Settlement Receipt
        </h4>
        <RefundSummary view={view} amountLabel="Refunded:" amount={amountToDisplay} />
      </div>

      {/* Action Bar */}
      <ReceiptActionBar referenceId={view.id} />
    </div>
  );
}

export function RefundUnavailablePanel({ view }: Readonly<{ view: RefundSessionView }>) {
  return (
    <div className="flex flex-col">
      <StatusPanel
        icon={<StatusIcon variant="expired" />}
        iconClassName="bg-yellow-500/10 border border-yellow-500/20 shadow-yellow-500/5"
        title="Nothing to refund"
      >
        <p className="text-sm text-muted mb-6 leading-relaxed">
          There is no refundable balance remaining on this order. If you believe this is an error,
          please contact <strong className="text-text">{view.merchantName}</strong> directly.
        </p>
      </StatusPanel>

      <div className="mt-4">
        <RefundSummary view={view} amountLabel="Remaining balance:" amount={0} />
      </div>

      <ReceiptActionBar referenceId={view.id} />
    </div>
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
