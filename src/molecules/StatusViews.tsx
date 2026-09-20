import { AlertTriangle } from 'lucide-react';

import type { CheckoutSession } from '../types/checkout';

import StatusIcon from '../atoms/StatusIcon';
import { formatCurrency } from '../utils/formatCurrency';
import ReceiptActionBar from './ReceiptActionBar';

export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-5 bg-lineSoft rounded w-1/3 mb-2" />
      <div className="h-32 bg-lineSoft rounded-2xl w-full mb-2" />
      <div className="space-y-4">
        <div className="h-12 bg-lineSoft rounded-xl w-full" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-lineSoft rounded-xl" />
          <div className="h-12 bg-lineSoft rounded-xl" />
        </div>
        <div className="h-12 bg-lineSoft rounded-xl w-full" />
      </div>
      <div className="h-14 bg-lineSoft rounded-xl w-full mt-4" />
    </div>
  );
}

export function PaidView({ session }: Readonly<{ session: CheckoutSession }>) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-lineSoft mb-3">
        <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center bg-brandDim/80 border border-brand/35 shadow-brand/10">
          <StatusIcon variant="success" size={36} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text">Payment Successful</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Paid
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5 leading-relaxed">
            Thank you! Your payment to {session.merchant?.name ?? 'the merchant'} has been
            processed successfully.
          </p>
        </div>
      </div>


      {/* Payment Receipt Summary */}
      <div className="w-full bg-panel2/60 border border-lineSoft rounded-xl p-5 text-left text-xs text-muted space-y-3 my-4">
        <div className="flex justify-between items-center py-0.5 border-b border-lineSoft/50">
          <span className="font-medium text-muted">Order Reference:</span>
          <span className="font-mono text-text font-semibold">{session.orderId}</span>
        </div>
        <div className="flex justify-between items-center py-0.5 border-b border-lineSoft/50">
          <span className="font-medium text-muted">Amount Paid:</span>
          <span className="text-brand font-bold text-base">
            {formatCurrency(session.amount, session.currency)}
          </span>
        </div>
        <div className="flex justify-between items-center py-0.5 border-b border-lineSoft/50">
          <span className="font-medium text-muted">Merchant:</span>
          <span className="text-text font-semibold">{session.merchant?.name ?? 'Merchant'}</span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span className="font-medium text-muted">Status:</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Settled with Merchant
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <ReceiptActionBar referenceId={session.orderId} />
    </div>
  );
}

export function FailedView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/5">
        <StatusIcon variant="failed" />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">Payment Failed</h2>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        This payment attempt was unsuccessful. Please return to the merchant application and try
        again.
      </p>
    </div>
  );
}

export function ExpiredView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/5">
        <StatusIcon variant="expired" />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">Payment Expired</h2>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        This checkout session has expired. Please contact the merchant to request a new session.
      </p>
    </div>
  );
}

export interface ErrorBannerProps {
  message: string | null;
  onClose?: () => void;
}

export function ErrorBanner({ message, onClose }: Readonly<ErrorBannerProps>) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-xl text-xs mb-4">
      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
      <div className="flex-1">
        <p className="font-semibold mb-0.5 text-red-900">Payment Error</p>
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-red-500 hover:text-red-700 text-xs font-semibold self-start"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
