import { useState } from 'react';

import Button from '../atoms/Button';

interface ReceiptActionBarProps {
  referenceId?: string | undefined;
  onHelpClick?: (() => void) | undefined;
}

function handlePrint(): void {
  window.print();
}

export default function ReceiptActionBar({
  referenceId,
  onHelpClick,
}: Readonly<ReceiptActionBarProps>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referenceId) return;
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-lineSoft w-full no-print">
      <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
        <svg
          className="w-3.5 h-3.5 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        Print Receipt
      </Button>

      {referenceId && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void handleCopy();
          }}
        >
          <svg
            className="w-3.5 h-3.5 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
          {copied ? 'Copied ID!' : 'Copy Reference'}
        </Button>
      )}

      {onHelpClick && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onHelpClick}
          className="text-muted hover:text-text"
        >
          <svg
            className="w-3.5 h-3.5 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Need Help?
        </Button>
      )}
    </div>
  );
}
