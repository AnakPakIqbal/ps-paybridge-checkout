import { useState } from 'react';

import type { SubscriptionSessionView } from '../../types/subscription';

import Button from '../../atoms/Button';
import StatusIcon from '../../atoms/StatusIcon';
import NoticeBanner from '../../molecules/NoticeBanner';
import ReceiptActionBar from '../../molecules/ReceiptActionBar';
import StatusPanel from '../../molecules/StatusPanel';
import SubscriptionPassCard from '../../molecules/SubscriptionPassCard';
import SubscriptionTimeline from '../../molecules/SubscriptionTimeline';
import { SUBSCRIPTION_MODE, SUBSCRIPTION_SESSION_STATE } from '../../types/subscription';
import PlanSummary from './PlanSummary';

interface SubscriptionStatusPanelProps {
  view: SubscriptionSessionView;
  cancelling: boolean;
  actionError: string | null;
  onCancel: () => void;
  onDismissError: () => void;
}

const BRAND_ICON = 'bg-brandDim/80 border border-brand/35 shadow-brand/10';

function CancelControl({
  merchantName,
  cancelling,
  onCancel,
}: Readonly<{ merchantName: string; cancelling: boolean; onCancel: () => void }>) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="py-4 my-2 border-t border-lineSoft flex flex-col items-center sm:flex-row sm:justify-between gap-3 text-xs text-muted">
        <div>
          <span className="font-semibold text-text block">Manage Membership</span>
          <span>You can cancel recurring billing at any time.</span>
        </div>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            setConfirming(true);
          }}
          className="shrink-0"
        >
          Cancel subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-red-500/30 bg-red-500/5 rounded-2xl p-5 my-4">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <p className="text-sm text-text font-bold">Cancel this subscription?</p>
      </div>
      <p className="text-xs text-muted leading-relaxed">
        Billing stops immediately and cannot be resumed &mdash; you would need a new invitation link
        from <strong className="text-text">{merchantName}</strong> to subscribe again. Payments you
        have already made are not refunded.
      </p>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          disabled={cancelling}
          onClick={() => {
            setConfirming(false);
          }}
        >
          Keep it
        </Button>
        <Button
          type="button"
          disabled={cancelling}
          onClick={onCancel}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {cancelling ? 'Cancelling…' : 'Yes, cancel'}
        </Button>
      </div>
    </div>
  );
}

export default function SubscriptionStatusPanel({
  view,
  cancelling,
  actionError,
  onCancel,
  onDismissError,
}: Readonly<SubscriptionStatusPanelProps>) {
  const nextDate = view.subscription?.nextBillingDate ?? null;

  if (view.state === SUBSCRIPTION_SESSION_STATE.CANCELED) {
    return (
      <div className="flex flex-col">
        <StatusPanel
          icon={<StatusIcon variant="expired" />}
          iconClassName="bg-yellow-500/10 border border-yellow-500/20 shadow-yellow-500/5"
          title="Subscription canceled"
        >
          <p className="text-sm text-muted mb-6 leading-relaxed">
            This subscription is no longer active and you will not be billed again. If this is not
            what you expected, please contact{' '}
            <strong className="text-text">{view.merchantName}</strong>.
          </p>
        </StatusPanel>

        <SubscriptionTimeline currentStep="canceled" nextBillingDate={null} />
        <PlanSummary view={view} dateLabel="Last payment" date={null} />

        <ReceiptActionBar referenceId={view.subscription?.id ?? view.id} />
      </div>
    );
  }

  if (view.state === SUBSCRIPTION_SESSION_STATE.ACTIVATING) {
    return (
      <div className="flex flex-col">
        <StatusPanel
          icon={<StatusIcon variant="waiting" />}
          iconClassName={BRAND_ICON}
          title="Activating your subscription"
        >
          <p className="text-sm text-muted mb-6 leading-relaxed" role="status">
            Your card was saved and the subscription is being set up with the payment provider.
            This page updates automatically.
          </p>
        </StatusPanel>

        <SubscriptionTimeline currentStep="activating" nextBillingDate={view.plan.anchorDate} />
        <PlanSummary view={view} dateLabel="First payment" date={view.plan.anchorDate} />
      </div>
    );
  }

  if (view.state === SUBSCRIPTION_SESSION_STATE.REQUIRES_ACTION) {
    return (
      <div className="flex flex-col">
        <StatusPanel
          icon={<StatusIcon variant="expired" />}
          iconClassName="bg-yellow-500/10 border border-yellow-500/20 shadow-yellow-500/5"
          title="One more step needed"
        >
          <p className="text-sm text-muted mb-6 leading-relaxed">
            The payment provider needs one more step from you before this subscription can begin.
            Please contact{' '}
            <strong className="text-text">{view.merchantName}</strong> for assistance.
          </p>
        </StatusPanel>

        <PlanSummary view={view} dateLabel="First payment" date={view.plan.anchorDate} />
      </div>
    );
  }

  const justSubscribed = view.mode === SUBSCRIPTION_MODE.CREATE;

  return (
    <div className="flex flex-col">
      {/* Status Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-lineSoft">
        <div
          className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${BRAND_ICON}`}
        >
          <StatusIcon variant="success" size={36} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text">
              {justSubscribed ? "You're subscribed!" : 'Subscription active'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5 leading-relaxed">
            {justSubscribed
              ? `Thank you! Your subscription with ${view.merchantName} is active and ready.`
              : `Your recurring membership with ${view.merchantName} is active.`}
          </p>
        </div>
      </div>

      {/* Hero Membership Pass Card */}
      <SubscriptionPassCard view={view} nextDate={nextDate} />

      {/* Visual Lifecycle Timeline */}
      <SubscriptionTimeline currentStep="active" nextBillingDate={nextDate} />

      {/* Detailed Plan Breakdown */}
      <div className="mt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Billing & Plan Details
        </h4>
        <PlanSummary view={view} dateLabel="Next payment" date={nextDate} />
      </div>

      {/* Manage / Cancel Controls if in Manage mode */}
      {view.mode === SUBSCRIPTION_MODE.MANAGE && (
        <div className="w-full">
          {actionError && (
            <NoticeBanner
              tone="error"
              title="Could not cancel"
              message={actionError}
              onClose={onDismissError}
            />
          )}
          <CancelControl
            merchantName={view.merchantName}
            cancelling={cancelling}
            onCancel={onCancel}
          />
        </div>
      )}

      {/* Receipt Action Bar (Print, Copy ID, Support) */}
      <ReceiptActionBar referenceId={view.subscription?.id ?? view.id} />
    </div>
  );
}
