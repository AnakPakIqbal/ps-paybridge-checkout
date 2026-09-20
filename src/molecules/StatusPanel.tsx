import type { ReactNode } from 'react';

interface StatusPanelProps {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  children: ReactNode;
}

// The centred icon-and-headline layout the terminal states of the hosted pages share
// (refund done, subscription cancelled, link expired ...).
export default function StatusPanel({
  icon,
  iconClassName,
  title,
  children,
}: Readonly<StatusPanelProps>) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-6 max-w-sm mx-auto">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${iconClassName}`}
      >
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-text mb-2">{title}</h1>
      {children}
    </div>
  );
}
