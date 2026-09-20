import { Eyebrow } from '../atoms/Text';

interface AmountDisplayProps {
  amount: string;
  reference: string;
}

export default function AmountDisplay({ amount, reference }: Readonly<AmountDisplayProps>) {
  return (
    <div className="flex flex-col gap-1 pb-3.5 border-b border-lineSoft">
      <div className="flex items-center justify-between">
        <Eyebrow className="mb-0 text-[10px] uppercase font-bold tracking-wider text-muted">
          Amount Due
        </Eyebrow>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Ready to Pay
        </span>
      </div>
      <div
        className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight font-sans"
        id="amount-value"
      >
        {amount}
      </div>
      <p className="text-[11px] text-muted font-mono flex items-center gap-1 mt-0.5">
        <span>Order ref:</span>
        <span className="font-semibold text-text bg-panel2 px-1.5 py-0.5 rounded border border-lineSoft">
          {reference}
        </span>
      </p>
    </div>
  );
}
