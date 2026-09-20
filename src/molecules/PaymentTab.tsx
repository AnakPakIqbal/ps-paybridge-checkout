import { Check, CreditCard, Landmark, Wallet } from 'lucide-react';
import {
  AmexIcon,
  JCBLogoIcon,
  MastercardLogoIcon,
  VisaLogoIcon,
} from 'react-svg-credit-card-payment-icons';

import type { PaymentMethodTabId } from '../types/checkout';

import { PAYMENT_METHOD_TAB } from '../types/checkout';

interface PaymentTabProps {
  id: PaymentMethodTabId;
  label: string;
  description?: string | undefined;
  active: boolean;
  compact?: boolean;
  onClick: () => void;
}

const TAB_CONFIG: Record<
  PaymentMethodTabId,
  {
    icon: typeof CreditCard;
    iconBg: string;
    sublabel: string;
    badges: string[];
  }
> = {
  [PAYMENT_METHOD_TAB.CARD]: {
    icon: CreditCard,
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    sublabel: 'Credit / Debit Card',
    badges: ['VISA', 'Mastercard', 'JCB'],
  },
  [PAYMENT_METHOD_TAB.VA]: {
    icon: Landmark,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    sublabel: 'Bank Transfer',
    badges: ['BCA', 'Mandiri', 'BNI', 'BRI'],
  },
  [PAYMENT_METHOD_TAB.EWALLET]: {
    icon: Wallet,
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    sublabel: 'Digital Wallet & QRIS',
    badges: ['QRIS', 'GoPay', 'OVO', 'DANA'],
  },
};

export default function PaymentTab({
  id,
  label,
  description,
  active,
  compact = false,
  onClick,
}: Readonly<PaymentTabProps>) {
  const config = TAB_CONFIG[id];
  const IconComponent = config.icon;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex-1 min-w-0 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
          active
            ? 'bg-white text-brand shadow-sm ring-1 ring-brand/20'
            : 'text-muted hover:text-text hover:bg-white/50'
        }`}
      >
        <span className={`p-1 rounded-md ${active ? config.iconBg : 'text-muted'}`}>
          <IconComponent size={14} />
        </span>
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group w-full h-full flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
        active
          ? 'border-brand bg-brandDim/30 shadow-md shadow-brand/10 ring-2 ring-brand/15'
          : 'border-lineSoft bg-white hover:border-brand/40 hover:bg-slate-50/80 hover:-translate-y-0.5 shadow-xs'
      }`}
    >
      {/* Top row: Icon badge + Radio Indicator */}
      <div className="flex items-center justify-between w-full mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${config.iconBg}`}
        >
          <IconComponent size={18} />
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            active
              ? 'border-brand bg-brand text-white shadow-xs'
              : 'border-lineSoft group-hover:border-line'
          }`}
        >
          {active && <Check size={11} strokeWidth={3} />}
        </div>
      </div>

      {/* Middle: Title & Description */}
      <div className="flex-1 my-1">
        <h3 className="font-bold text-sm text-text group-hover:text-brand transition-colors">
          {label}
        </h3>
        <p className="text-[11px] text-muted mt-0.5 leading-relaxed line-clamp-2">
          {description ?? config.sublabel}
        </p>
      </div>

      {/* Bottom: Supported Badges & Existing Logos */}
      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-lineSoft/60 w-full min-h-[30px] overflow-hidden">
        {id === PAYMENT_METHOD_TAB.CARD ? (
          <div className="flex items-center gap-1.5">
            <span
              title="Visa"
              className="bg-white rounded px-1.5 py-0.5 border border-lineSoft flex items-center shadow-2xs shrink-0"
            >
              <VisaLogoIcon width={28} className="h-3 w-auto" />
            </span>
            <span
              title="Mastercard"
              className="bg-white rounded px-1.5 py-0.5 border border-lineSoft flex items-center shadow-2xs shrink-0"
            >
              <MastercardLogoIcon width={20} className="h-3 w-auto" />
            </span>
            <span
              title="JCB"
              className="bg-white rounded px-1.5 py-0.5 border border-lineSoft flex items-center shadow-2xs shrink-0"
            >
              <JCBLogoIcon width={18} className="h-3 w-auto" />
            </span>
            <span
              title="American Express"
              className="bg-white rounded px-1.5 py-0.5 border border-lineSoft flex items-center shadow-2xs shrink-0"
            >
              <AmexIcon width={18} className="h-3 w-auto" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 w-full flex-nowrap overflow-x-hidden">
            {config.badges.map((badge) => (
              <span
                key={badge}
                className="text-[9px] font-semibold text-slate-600 bg-white border border-lineSoft px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap shrink-0"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
