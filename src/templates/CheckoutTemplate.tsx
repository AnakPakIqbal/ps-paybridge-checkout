import type { ReactNode } from 'react';

interface CheckoutTemplateProps {
  left: ReactNode;
  right: ReactNode;
  hideLeft?: boolean;
}

export default function CheckoutTemplate({
  left,
  right,
  hideLeft = false,
}: Readonly<CheckoutTemplateProps>) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:py-8">
      <div
        id="checkout-card"
        className={`w-full max-w-5xl flex flex-col md:grid bg-panel border border-line rounded-xl2 overflow-hidden shadow-2xl shadow-black/40 transition-[grid-template-columns] duration-300 ease-out ${
          hideLeft ? 'md:grid-cols-[0px_1fr]' : 'md:grid-cols-[340px_1fr]'
        }`}
      >
        <div
          className={`bg-panel2 border-lineSoft overflow-hidden transition-[opacity,max-height] duration-300 ease-out md:border-r ${
            hideLeft
              ? 'max-h-0 opacity-0 border-b-0'
              : 'max-h-[1000px] opacity-100 border-b md:border-b-0'
          }`}
        >
          {left}
        </div>
        <div className="p-5 sm:p-8 md:py-6">{right}</div>
      </div>
    </div>
  );
}
