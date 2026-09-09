import { Landmark } from 'lucide-react';

interface BankOptionProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

// Deliberately mirrors WalletOption: a single row per bank, icon left, name right.
// The previous centred two-column grid gave each tile roughly half a phone screen,
// so longer names ("Sahabat Sampoerna") wrapped and the uppercase monospace made
// every bank read as an abbreviation.
export default function BankOption({ label, active, onClick }: Readonly<BankOptionProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border py-3 px-4 text-sm font-semibold transition-all duration-150 outline-none ${
        active
          ? 'border-brand text-text bg-brandDim/40 ring-1 ring-brand/35 shadow-lg shadow-brand/5'
          : 'border-lineSoft text-muted bg-panel2 hover:border-line hover:text-text'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          active ? 'bg-brand/20 text-brand' : 'bg-panel/80 text-muted'
        }`}
      >
        <Landmark size={18} />
      </div>
      <span className="font-medium tracking-wide text-left">{label}</span>
    </button>
  );
}
