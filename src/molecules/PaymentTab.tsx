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
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors duration-150 ${
          active
            ? 'border-brand text-text bg-brandDim/40'
            : 'border-lineSoft text-muted bg-panel2 hover:border-line'
        }`}
      >
        <Icon path={icon} size={16} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 rounded-xl2 border p-4 text-center transition-all duration-200 ${
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
