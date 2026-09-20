import type { ReactNode } from 'react';

interface SinglePanelTemplateProps {
  children: ReactNode;
}

// The card chrome CheckoutTemplate uses, without its two-column order-summary layout:
// the refund and subscription pages are one focused panel, not a payment form beside a
// summary.
export default function SinglePanelTemplate({ children }: Readonly<SinglePanelTemplateProps>) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:py-8">
      <main className="w-full max-w-lg bg-panel border border-line rounded-xl2 overflow-hidden shadow-2xl shadow-black/40 p-5 sm:p-8">
        {children}
      </main>
    </div>
  );
}
