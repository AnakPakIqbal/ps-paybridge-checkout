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
    <div className="w-full bg-panel2/60 border border-lineSoft rounded-xl p-4 text-left text-xs text-muted space-y-2.5 my-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex justify-between items-center gap-4 py-0.5 border-b border-lineSoft/50 last:border-0 last:pb-0"
        >
          <span className="font-medium text-muted">{row.label}</span>
          <span
            className={
              row.emphasized
                ? 'text-brand font-bold text-sm tracking-tight'
                : 'text-text text-right font-medium'
            }
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
