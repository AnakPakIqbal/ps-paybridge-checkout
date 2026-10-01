import { useState, type ReactNode } from 'react';

interface CollapsibleDetailsProps {
  title: string;
  children: ReactNode;
  className?: string;
}

// Same open/close pattern as the FAQ accordion in OrderSummaryPanel.tsx --
// collapsed by default, a full-width button toggles a +/- glyph. Used to hide
// secondary detail (reference/order ID, item/customer breakdown, billing/plan
// breakdown) behind one click instead of always showing it.
export default function CollapsibleDetails({
  title,
  children,
  className = '',
}: Readonly<CollapsibleDetailsProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
        }}
        className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-muted hover:text-text transition-colors gap-2"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-sm shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
