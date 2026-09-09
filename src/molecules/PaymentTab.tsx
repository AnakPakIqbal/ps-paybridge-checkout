import Icon from '../atoms/Icon';

interface PaymentTabProps {
  icon: string;
  label: string;
  description?: string | undefined;
  active: boolean;
  compact?: boolean;
  onClick: () => void;
}

export default function PaymentTab({
  icon,
  label,
  description,
  active,
  compact = false,
  onClick,
}: Readonly<PaymentTabProps>) {
  // Once a method is chosen these become a segmented control: one bordered track
  // with the active segment raised out of it, rather than three separate bordered
  // buttons competing with the panel below them. The icon is dropped on the
  // narrowest screens so "Virtual Account" stays on one line.
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex-auto min-w-0 flex items-center justify-center gap-1.5 rounded-lg px-1.5 sm:px-3 py-2 text-[11px] sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
          active
            ? 'bg-panel text-brand shadow-sm ring-1 ring-brand/20'
            : 'text-muted hover:text-text'
        }`}
      >
        <Icon path={icon} size={15} className="hidden sm:block flex-shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full sm:flex-1 flex flex-col items-center gap-2 rounded-xl2 border p-4 text-center transition-all duration-200 ${
        active
          ? 'border-brand bg-brandDim/40 shadow-sm shadow-brand/10'
          : 'border-lineSoft text-muted bg-panel2 hover:border-line hover:-translate-y-0.5'
      }`}
    >
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 ${
          active ? 'bg-brand text-white' : 'bg-brandDim/60 text-brand'
        }`}
      >
        <Icon path={icon} size={18} />
      </span>
      <span className={`text-sm font-semibold ${active ? 'text-text' : 'text-text/90'}`}>
        {label}
      </span>
      {description && <span className="text-[11px] text-muted leading-tight">{description}</span>}
    </button>
  );
}
