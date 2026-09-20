import { useState } from 'react';

import type { SubscriptionSessionView } from '../../types/subscription';

import Button from '../../atoms/Button';
import StatusIcon from '../../atoms/StatusIcon';
import NoticeBanner from '../../molecules/NoticeBanner';
import StatusPanel from '../../molecules/StatusPanel';
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
  // One inline confirm step, no email or OTP: the link itself is the authorisation, the same
  // as for checkout and refund. The extra click only guards against a stray tap.
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setConfirming(true);
        }}
      >
        Cancel subscription
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-red-500/30 bg-red-500/5 rounded-xl p-4">
      <p className="text-sm text-text font-semibold">Cancel this subscription?</p>
      <p className="text-xs text-muted leading-relaxed">
        Billing stops immediately and cannot be resumed — you would need a new link from{' '}
        {merchantName} to subscribe again. Payments you have already made are not refunded.
      </p>
      <div className="grid grid-cols-2 gap-3">
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
        <Button type="button" disabled={cancelling} onClick={onCancel}>
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
      <StatusPanel
        icon={<StatusIcon variant="expired" />}
        iconClassName="bg-yellow-500/10 border border-yellow-500/20 shadow-yellow-500/5"
        title="Subscription canceled"
      >
        <p className="text-sm text-muted mb-6 leading-relaxed">
          This subscription is no longer active and you will not be billed again. If that is not
          what you expected, contact {view.merchantName}.
        </p>
        <PlanSummary view={view} dateLabel="Next payment" date={null} />
      </StatusPanel>
    );
  }

  if (view.state === SUBSCRIPTION_SESSION_STATE.ACTIVATING) {
    return (
      <StatusPanel
        icon={<StatusIcon variant="waiting" />}
        iconClassName={BRAND_ICON}
        title="Activating your subscription"
      >
        <p className="text-sm text-muted mb-6 leading-relaxed" role="status">
          Your card was saved and the subscription is being set up. This page updates by itself.
        </p>
        <PlanSummary view={view} dateLabel="First payment" date={view.plan.anchorDate} />
      </StatusPanel>
    );
  }

  if (view.state === SUBSCRIPTION_SESSION_STATE.REQUIRES_ACTION) {
    return (
      <StatusPanel
        icon={<StatusIcon variant="expired" />}
        iconClassName="bg-yellow-500/10 border border-yellow-500/20 shadow-yellow-500/5"
        title="One more step needed"
      >
        <p className="text-sm text-muted mb-6 leading-relaxed">
          Your bank needs an extra confirmation before this subscription can start billing. Please
          contact {view.merchantName} for help completing it.
        </p>
        <PlanSummary view={view} dateLabel="First payment" date={view.plan.anchorDate} />
      </StatusPanel>
    );
  }

  const justSubscribed = view.mode === SUBSCRIPTION_MODE.CREATE;
  return (
    <StatusPanel
      icon={<StatusIcon variant="success" />}
      iconClassName={BRAND_ICON}
      title={justSubscribed ? "You're subscribed" : 'Subscription active'}
    >
      <p className="text-sm text-muted mb-6 leading-relaxed">
        {justSubscribed
          ? `Thank you! Your subscription with ${view.merchantName} is active. You can close this tab safely.`
          : `Your subscription with ${view.merchantName} is active.`}
      </p>
      <PlanSummary view={view} dateLabel="Next payment" date={nextDate} />

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
    </StatusPanel>
  );
}
