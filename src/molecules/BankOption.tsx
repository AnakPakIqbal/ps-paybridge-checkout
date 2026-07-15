import { Landmark } from 'lucide-react';

interface BankOptionProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function BankOption({ label, active, onClick }: Readonly<BankOptionProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border py-4 px-3 text-sm font-semibold transition-all duration-150 outline-none ${
        active
          ? 'border-brand text-text bg-brandDim/40 ring-1 ring-brand/35 shadow-lg shadow-brand/5'
          : 'border-lineSoft text-muted bg-panel2 hover:border-line hover:text-text'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          active ? 'bg-brand/20 text-brand' : 'bg-panel/80 text-muted'
        }`}
      >
        <Landmark size={18} />
      </div>
      <span className="text-xs font-semibold tracking-wider font-mono uppercase">{label}</span>
    </button>
  );
}
