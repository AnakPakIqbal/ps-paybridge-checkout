import type { ReactNode } from 'react';

import PortalFooter from '../molecules/PortalFooter';
import PortalHeader from '../molecules/PortalHeader';

interface CheckoutTemplateProps {
  form: ReactNode;
  sidebar: ReactNode;
  merchantName?: string | undefined;
}

/**
 * 2-Panel Checkout Portal Template matching Subscription & Refund:
 * - Left Panel (7 cols): Primary payment methods, forms, and instructions.
 * - Right Panel (5 cols): Sticky sidebar showing all information (Order summary,
 *   merchant trust profile, honest security assurances, and FAQs).
 */
export default function CheckoutTemplate({
  form,
  sidebar,
  merchantName,
}: Readonly<CheckoutTemplateProps>) {
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

      <PortalHeader merchantName={merchantName} portalType="checkout" />

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 md:py-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Primary Payment Action & Forms (7 cols) - STICKY FOLLOWING VIEWPORT */}
          <main
            id="checkout-main-panel"
            className="lg:col-span-7 bg-panel border border-line rounded-2xl shadow-xl shadow-brand/5 p-6 sm:p-8 transition-all print-clean lg:sticky lg:top-6 lg:self-start"
          >
            {form}
          </main>

          {/* Right Panel: Sidebar showing all information (5 cols) - SCROLLS NATURALLY */}
          <aside
            id="checkout-sidebar"
            className="lg:col-span-5 flex flex-col gap-5 no-print"
          >
            {sidebar}
          </aside>
        </div>
      </div>

      <PortalFooter />
    </div>
  );
}
