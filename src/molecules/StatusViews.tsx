import { AlertTriangle } from 'lucide-react';

import type { CheckoutSession } from '../types/checkout';

import StatusIcon from '../atoms/StatusIcon';
import { formatCurrency } from '../utils/formatCurrency';

export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-5 bg-lineSoft rounded w-1/3 mb-2" />
      <div className="h-32 bg-lineSoft rounded-xl2 w-full mb-2" />
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
    <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-brandDim/80 border border-brand/35 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand/10">
        <StatusIcon variant="success" />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">Payment Successful</h2>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        Thank you! Your payment has been processed successfully. You can now close this tab safely.
      </p>
      <div className="w-full bg-panel2 border border-lineSoft rounded-xl p-4 text-left text-xs text-muted space-y-2 mb-2">
        <div className="flex justify-between">
          <span>Order Ref:</span>
          <span className="font-mono text-text">{session.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Paid:</span>
          <span className="text-brand font-semibold">
            {formatCurrency(session.amount, session.currency)}
          </span>
        </div>
      </div>
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
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-xs mb-4">
      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
      <div className="flex-1">
        <p className="font-semibold mb-0.5">Payment Error</p>
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-red-400 hover:text-red-200 text-xs font-semibold self-start"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
