import type { ReactNode } from 'react';

import PortalFooter from '../molecules/PortalFooter';
import PortalHeader from '../molecules/PortalHeader';

interface SinglePanelTemplateProps {
  children: ReactNode;
  sidebar?: ReactNode | undefined;
  merchantName?: string | undefined;
  portalType?: 'subscription' | 'refund' | 'portal' | undefined;
}

/**
 * Enterprise Hosted Portal Template for Subscription and Refund workflows.
 * Provides ambient brand backgrounds, top security/portal navigation,
 * a balanced 2-column responsive layout (Main Card + Sticky Side Trust/FAQ Rail),
 * and compliance trust footer.
 */
export default function SinglePanelTemplate({
  children,
  sidebar,
  merchantName,
  portalType = 'portal',
}: Readonly<SinglePanelTemplateProps>) {
  return (
    <div className="min-h-screen portal-bg-mesh flex flex-col justify-between relative">
      {/* Decorative ambient gradient orbs in an isolated overflow-hidden layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
      >
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[350px] bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-1/4 translate-x-1/2 w-[500px] h-[350px] bg-brandSoft/20 rounded-full blur-3xl" />
      </div>

      <PortalHeader merchantName={merchantName} portalType={portalType} />

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 md:py-6">
        {sidebar ? (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <main
              id="portal-main-panel"
              className="lg:col-span-7 bg-panel border border-line rounded-2xl overflow-hidden shadow-xl shadow-brand/5 p-6 sm:p-8 transition-all print-clean"
            >
              {children}
            </main>
            <div className="lg:col-span-5 flex flex-col gap-6 no-print lg:sticky lg:top-6 lg:self-start">
              {sidebar}
            </div>
          </div>
        ) : (
          <main
            id="portal-main-panel"
            className="w-full max-w-xl bg-panel border border-line rounded-2xl overflow-hidden shadow-xl shadow-brand/5 p-6 sm:p-8 transition-all print-clean"
          >
            {children}
          </main>
        )}
      </div>

      <PortalFooter />
    </div>
  );
}
