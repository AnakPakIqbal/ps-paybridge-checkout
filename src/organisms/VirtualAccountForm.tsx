import { Info } from 'lucide-react';

import type { PaymentAttempt, PaymentMethodOption } from '../types/checkout';

import BankOption from '../molecules/BankOption';
import VaBox from '../molecules/VaBox';
import { PAYMENT_METHOD_CATEGORY } from '../types/checkout';

interface ParsedVaUrl {
  provider: string;
  bank: string;
  number: string;
}

const parseVaUrl = (url: string | undefined): ParsedVaUrl | null => {
  if (!url) return null;
  const match = /^(midtrans|xendit)-va:\/\/([^/]+)\/(.+)$/.exec(url);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  const [, provider, rawBank, vaNumber] = match;
  let bankName = rawBank;
  if (provider === 'xendit') {
    bankName = rawBank.replace(/_VIRTUAL_ACCOUNT$/, '');
  }
  return {
    provider,
    bank: bankName.toUpperCase(),
    number: vaNumber,
  };
};

const formatVaNumber = (number: string) => {
  return number.replace(/(.{4})/g, '$1 ').trim();
};

const getBankIdFromMethodCode = (code: string) => {
  const upper = code.toUpperCase();
  if (upper.includes('BCA')) return 'BCA';
  if (upper.includes('BNI')) return 'BNI';
  if (upper.includes('BRI')) return 'BRI';
  if (upper.includes('MANDIRI')) return 'Mandiri';
  if (upper.includes('PERMATA')) return 'Permata';
  if (upper.includes('CIMB')) return 'CIMB';
  return 'Bank';
};

interface VirtualAccountFormProps {
  availableMethods?: PaymentMethodOption[];
  selectedMethod?: string;
  setSelectedMethod?: (code: string) => void;
  paymentAttempt?: PaymentAttempt | null;
}

export default function VirtualAccountForm({
  availableMethods = [],
  selectedMethod = '',
  setSelectedMethod,
  paymentAttempt = null,
}: Readonly<VirtualAccountFormProps>) {
  if (paymentAttempt) {
    const vaInfo = parseVaUrl(paymentAttempt.checkoutUrl);
    const bankName = vaInfo ? vaInfo.bank : 'Virtual Account';
    const rawNumber = vaInfo ? vaInfo.number : (paymentAttempt.checkoutUrl ?? '');
    const vaDisplayNumber = formatVaNumber(rawNumber);

    const copy = () => {
      void navigator.clipboard.writeText(rawNumber);
    };

    return (
      <div className="flex flex-col gap-5 h-full">
        <div>
          <h2 className="text-base font-semibold text-text mb-1">
            Transfer to {bankName} Virtual Account
          </h2>
          <p className="text-xs text-muted mb-4">
            Use the details below to complete your transfer via mobile banking or ATM.
          </p>
        </div>

        <VaBox number={vaDisplayNumber} onCopy={copy} />

        <div className="bg-panel px-4 py-4 rounded-xl border border-lineSoft space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-lineSoft pb-2">
            <Info size={14} className="text-brand" />
            <p className="text-xs font-semibold text-text">Payment Instructions</p>
          </div>
          <div className="text-xs text-muted leading-relaxed space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="font-semibold text-brand min-w-[14px]">1.</span>
              <span>Log in to your banking app or proceed to an ATM.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-semibold text-brand min-w-[14px]">2.</span>
              <span>
                Select <span className="text-text font-medium">Transfer</span>, then choose{' '}
                <span className="text-text font-medium">Virtual Account</span> (or Mandiri
                E-Billing).
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-semibold text-brand min-w-[14px]">3.</span>
              <span>Enter the virtual account number shown above.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-semibold text-brand min-w-[14px]">4.</span>
              <span>Confirm details match: the merchant name, amount, and reference.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-semibold text-brand min-w-[14px]">5.</span>
              <span>
                Complete transaction. The checkout page will automatically confirm your payment once
                verified.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vaMethods = availableMethods.filter(
    (option) => option.category === PAYMENT_METHOD_CATEGORY.VIRTUAL_ACCOUNT,
  );

  return (
    <div>
      <h2 className="text-sm font-semibold text-text mb-4">Select your bank</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {vaMethods.map((method) => {
          const bankId = getBankIdFromMethodCode(method.code);
          return (
            <BankOption
              key={method.code}
              label={bankId}
              active={selectedMethod === method.code}
              onClick={() => {
                setSelectedMethod?.(method.code);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
