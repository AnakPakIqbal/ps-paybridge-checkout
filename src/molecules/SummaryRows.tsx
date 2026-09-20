import type { ReactNode } from 'react';

export interface SummaryRow {
  label: string;
  value: ReactNode;
  // The row that matters most (an amount to be paid or refunded), set in the brand colour.
  emphasized?: boolean;
}

interface SummaryRowsProps {
  rows: SummaryRow[];
}

export default function SummaryRows({ rows }: Readonly<SummaryRowsProps>) {
  return (
    <div className="w-full bg-panel2 border border-lineSoft rounded-xl p-4 text-left text-xs text-muted space-y-2 mb-6">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-4">
          <span>{row.label}</span>
          <span className={row.emphasized ? 'text-brand font-semibold' : 'text-text text-right'}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
