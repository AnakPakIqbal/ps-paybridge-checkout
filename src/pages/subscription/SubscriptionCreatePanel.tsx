import type { SaveCardPreparation, SubscriptionSessionView } from '../../types/subscription';

import Button from '../../atoms/Button';
import NoticeBanner from '../../molecules/NoticeBanner';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  formatBillingDate,
  formatBillingInterval,
  formatProviderName,
  formatTotalRecurrence,
} from '../../utils/formatSubscription';
import PlanSummary from './PlanSummary';
import SaveCardStep from './SaveCardStep';

interface SubscriptionCreatePanelProps {
  view: SubscriptionSessionView;
  prepared: SaveCardPreparation | null;
  prepareError: string | null;
  activating: boolean;
  actionError: string | null;
  onRetryPrepare: () => void;
  onCardSaved: (savedTokenId?: string) => void;
  onCardError: (message: string) => void;
  onDismissError: () => void;
}

export default function SubscriptionCreatePanel({
  view,
  prepared,
  prepareError,
  activating,
  actionError,
  onRetryPrepare,
  onCardSaved,
  onCardError,
  onDismissError,
}: Readonly<SubscriptionCreatePanelProps>) {
  const { plan } = view;
  const length = formatTotalRecurrence(plan.totalRecurrence);
  const formattedPrice = formatCurrency(plan.amount, plan.currency);
  const formattedInterval = formatBillingInterval(plan.interval, plan.intervalCount);

  const renderCardEntry = () => {
    if (prepareError) {
      return (
        <div className="flex flex-col gap-3 p-4 bg-red-50/60 rounded-xl border border-red-200">
          <NoticeBanner tone="error" title="Card form unavailable" message={prepareError} />
          <Button type="button" variant="ghost" onClick={onRetryPrepare}>
            Try again
          </Button>
        </div>
      );
    }
    if (!prepared) {
      return (
        <div className="flex items-center justify-center p-8 bg-panel2/60 rounded-xl border border-lineSoft">
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <span>Loading the secure card form…</span>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-panel2/40 border border-lineSoft rounded-2xl p-5 shadow-xs">
        <SaveCardStep
          prepared={prepared}
          onCardSaved={onCardSaved}
          onError={onCardError}
          disabled={activating}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brandDim text-xs font-semibold text-brand mb-2 border border-brand/20">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          Subscription Setup
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text">Start your subscription</h1>
        <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
          <strong className="text-text">{view.merchantName}</strong> has invited you to subscribe to{' '}
          <strong className="text-text">{plan.description ?? 'this recurring membership'}</strong>.
        </p>
      </div>

      {/* Hero Plan Highlight Card */}
      <div className="bg-gradient-to-br from-brand/10 via-brandDim/40 to-panel2/80 border border-brand/25 rounded-2xl p-5 mb-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <span className="text-[11px] font-semibold text-brand uppercase tracking-wider block">
              Selected Plan
            </span>
            <h3 className="text-base font-bold text-text mt-0.5">
              {plan.description ?? 'Recurring Subscription'}
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand text-white text-xs font-bold shrink-0">
            {formattedInterval}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {formattedPrice}
          </span>
          <span className="text-xs text-muted font-medium">/ {formattedInterval}</span>
        </div>

        {/* Benefits Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-brand/15 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>First bill on {formatBillingDate(plan.anchorDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Duration: {length ?? 'Until cancelled'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Cancel at any time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Card entered directly with {formatProviderName(view.provider)}</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="mb-4">
          <NoticeBanner
            tone="error"
            title="Subscription error"
            message={actionError}
            onClose={onDismissError}
          />
        </div>
      )}

      {/* Payment Entry Section */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text flex items-center gap-2">
            <span>Payment Method</span>
            <span className="text-[11px] font-normal text-muted">(Credit or Debit Card)</span>
          </h2>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Handled by {formatProviderName(view.provider)}
          </span>
        </div>

        {renderCardEntry()}
      </div>

      {activating && (
        <div className="flex items-center justify-center gap-3 p-4 bg-brandDim/60 rounded-xl border border-brand/20 my-4 text-xs font-medium text-brand">
          <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span>Starting your subscription…</span>
        </div>
      )}

      {/* Detailed Plan Breakdown */}
      <div className="mt-4 pt-4 border-t border-lineSoft">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Full Schedule Breakdown
        </h4>
        <PlanSummary view={view} dateLabel="First payment" date={view.plan.anchorDate} />
      </div>

      <p className="text-[11px] text-muted text-center mt-2 leading-relaxed">
        Your card details are entered directly with {formatProviderName(view.provider)} and never
        reach PayBridge, which only keeps a token to bill the card on schedule.
        {' '}Your bank may ask you to confirm the card with 3-D Secure.
      </p>
    </div>
  );
}
