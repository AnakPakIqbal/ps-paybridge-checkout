import StatusIcon from '../atoms/StatusIcon';
import { useSubscriptionSession } from '../hooks/useSubscriptionSession';
import PortalSidebar from '../molecules/PortalSidebar';
import StatusPanel from '../molecules/StatusPanel';
import { SkeletonLoader } from '../molecules/StatusViews';
import SinglePanelTemplate from '../templates/SinglePanelTemplate';
import { SUBSCRIPTION_SESSION_STATE } from '../types/subscription';
import SubscriptionCreatePanel from './subscription/SubscriptionCreatePanel';
import SubscriptionStatusPanel from './subscription/SubscriptionStatusPanel';

function SubscriptionErrorPanel({ message }: Readonly<{ message: string }>) {
  return (
    <StatusPanel
      icon={<StatusIcon variant="failed" />}
      iconClassName="bg-red-500/10 border border-red-500/20 shadow-red-500/5"
      title="Subscription unavailable"
    >
      <p className="text-sm text-muted leading-relaxed">{message}</p>
    </StatusPanel>
  );
}

export default function SubscriptionPage() {
  const {
    view,
    loading,
    error,
    prepared,
    prepareError,
    retryPrepare,
    activating,
    cancelling,
    actionError,
    activate,
    cancel,
    reportCardError,
    dismissActionError,
  } = useSubscriptionSession();

  const renderBody = () => {
    if (loading) return <SkeletonLoader />;
    if (error) return <SubscriptionErrorPanel message={error} />;
    if (!view) return null;

    if (view.state === SUBSCRIPTION_SESSION_STATE.AWAITING_CARD) {
      return (
        <SubscriptionCreatePanel
          view={view}
          prepared={prepared}
          prepareError={prepareError}
          activating={activating}
          actionError={actionError}
          onRetryPrepare={retryPrepare}
          onCardSaved={(savedTokenId) => {
            void activate(savedTokenId);
          }}
          onCardError={reportCardError}
          onDismissError={dismissActionError}
        />
      );
    }

    return (
      <SubscriptionStatusPanel
        view={view}
        cancelling={cancelling}
        actionError={actionError}
        onCancel={() => {
          void cancel();
        }}
        onDismissError={dismissActionError}
      />
    );
  };

  const sidebar = view ? (
    <PortalSidebar
      merchantName={view.merchantName}
      type="subscription"
      orderReference={view.subscription?.id ?? view.id}
    />
  ) : undefined;

  return (
    <SinglePanelTemplate
      merchantName={view?.merchantName}
      portalType="subscription"
      sidebar={sidebar}
    >
      {renderBody()}
    </SinglePanelTemplate>
  );
}
