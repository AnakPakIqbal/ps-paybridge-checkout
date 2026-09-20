import type { RefundSessionView } from '../types/refund';

import { useRefundSession } from '../hooks/useRefundSession';
import PortalSidebar from '../molecules/PortalSidebar';
import { SkeletonLoader } from '../molecules/StatusViews';
import SinglePanelTemplate from '../templates/SinglePanelTemplate';
import { REFUND_SESSION_STATE } from '../types/refund';
import RefundReadyPanel from './refund/RefundReadyPanel';
import {
  RefundCompletedPanel,
  RefundErrorPanel,
  RefundProcessingPanel,
  RefundUnavailablePanel,
} from './refund/RefundStatusPanels';

interface StateViewProps {
  view: RefundSessionView;
}

function StateView({ view }: Readonly<StateViewProps>) {
  if (view.state === REFUND_SESSION_STATE.PROCESSING) return <RefundProcessingPanel view={view} />;
  if (view.state === REFUND_SESSION_STATE.COMPLETED) return <RefundCompletedPanel view={view} />;
  return <RefundUnavailablePanel view={view} />;
}

export default function RefundPage() {
  const { view, loading, error, submitting, confirmError, confirm, dismissConfirmError } =
    useRefundSession();

  const renderBody = () => {
    if (loading) return <SkeletonLoader />;
    if (error) return <RefundErrorPanel message={error} />;
    if (!view) return null;

    if (view.state === REFUND_SESSION_STATE.READY) {
      return (
        <RefundReadyPanel
          view={view}
          submitting={submitting}
          confirmError={confirmError}
          onConfirm={(reason) => {
            void confirm(reason);
          }}
          onDismissError={dismissConfirmError}
        />
      );
    }
    return <StateView view={view} />;
  };

  const sidebar = view ? (
    <PortalSidebar
      merchantName={view.merchantName}
      type="refund"
      orderReference={view.id.slice(0, 12)}
    />
  ) : undefined;

  return (
    <SinglePanelTemplate merchantName={view?.merchantName} portalType="refund" sidebar={sidebar}>
      {renderBody()}
    </SinglePanelTemplate>
  );
}
