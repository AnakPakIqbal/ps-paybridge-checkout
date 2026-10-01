import type { ReactNode } from 'react';

interface SinglePanelTemplateProps {
  children: ReactNode;
  sidebar?: ReactNode | undefined;
}

/**
 * Full-screen hosted-portal template, modelled on Stripe Checkout: no header, footer,
 * outer card or background decoration. With a sidebar the page is a two-column split
 * (tinted summary column | white form column, as in the Stripe reference); without one it is a single centred column.
 */
export default function SinglePanelTemplate({
  children,
  sidebar,
}: Readonly<SinglePanelTemplateProps>) {
  if (!sidebar) {
    return (
      <main
        id="portal-main-panel"
        className="min-h-screen bg-panel flex justify-center print-clean"
      >
        <div className="w-full max-w-xl p-6 sm:p-10 lg:py-16">{children}</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      <main
        id="portal-main-panel"
        className="lg:col-span-7 lg:order-2 bg-panel flex justify-center lg:justify-start print-clean"
      >
        <div className="w-full max-w-2xl p-6 sm:p-10 lg:py-16 lg:pl-14">{children}</div>
      </main>
      <aside className="order-first lg:col-span-5 bg-panel2 border-b lg:border-b-0 lg:border-r border-lineSoft flex justify-center lg:justify-end no-print">
        <div className="w-full max-w-md flex flex-col gap-6 p-6 sm:p-10 lg:py-16 lg:pr-14 lg:sticky lg:top-0 lg:self-start">
          {sidebar}
        </div>
      </aside>
    </div>
  );
}
