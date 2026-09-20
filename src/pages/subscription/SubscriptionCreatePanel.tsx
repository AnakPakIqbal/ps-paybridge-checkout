import type { SaveCardPreparation, SubscriptionSessionView } from '../../types/subscription';

import Button from '../../atoms/Button';
import NoticeBanner from '../../molecules/NoticeBanner';
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
  const renderCardEntry = () => {
    if (prepareError) {
      return (
        <div className="flex flex-col gap-3">
          <NoticeBanner tone="error" title="Card form unavailable" message={prepareError} />
          <Button type="button" variant="ghost" onClick={onRetryPrepare}>
            Try again
          </Button>
        </div>
      );
    }
    if (!prepared) {
      return (
        <p className="text-sm text-muted" role="status">
          Loading the secure card form…
        </p>
      );
    }
    return (
      <SaveCardStep
        prepared={prepared}
        onCardSaved={onCardSaved}
        onError={onCardError}
        disabled={activating}
      />
    );
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold text-text mb-1">Start your subscription</h1>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        {view.merchantName} has invited you to subscribe.
      </p>

      <PlanSummary view={view} dateLabel="First payment" date={view.plan.anchorDate} />

      {actionError && (
        <NoticeBanner
          tone="error"
          title="Subscription error"
          message={actionError}
          onClose={onDismissError}
        />
      )}

      <h2 className="text-sm font-semibold text-text mb-3">Payment details</h2>
      {renderCardEntry()}

      {activating && (
        <p className="text-sm text-muted text-center mt-4" role="status">
          Starting your subscription…
        </p>
      )}

      <p className="text-xs text-muted text-center mt-4 leading-relaxed">
        Your card is saved securely with the payment provider and billed on the schedule above. You
        can ask {view.merchantName} to cancel at any time.
      </p>
    </div>
  );
}
