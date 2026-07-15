import { Eyebrow } from '../atoms/Text';

interface AmountDisplayProps {
  amount: string;
  reference: string;
}

export default function AmountDisplay({ amount, reference }: Readonly<AmountDisplayProps>) {
  return (
    <div className="py-4 border-b border-lineSoft">
      <Eyebrow className="mb-1">Amount due</Eyebrow>
      <div className="text-3xl font-bold text-text tracking-tight" id="amount-value">
        {amount}
      </div>
      <p className="text-xs text-muted mt-1">Order ref: {reference}</p>
    </div>
  );
}
