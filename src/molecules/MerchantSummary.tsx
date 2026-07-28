import type { ReactNode } from 'react';

import { useState } from 'react';

import type { OrderItem } from '../types/checkout';

import Icon from '../atoms/Icon';
import { icons } from '../atoms/icons';
import { formatCurrency } from '../utils/formatCurrency';

interface RowProps {
  label: string;
  value: string;
  strong?: boolean;
}

function Row({ label, value, strong = false }: Readonly<RowProps>) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className={strong ? 'text-text font-semibold' : 'text-muted'}>{label}</span>
      <span className={strong ? 'text-brand font-semibold text-sm' : 'text-text font-medium'}>
        {value}
      </span>
    </div>
  );
}

interface CollapsibleSectionProps {
  icon: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

function CollapsibleSection({
  icon,
  title,
  defaultOpen = false,
  children,
}: Readonly<CollapsibleSectionProps>) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `${title.replace(/\s+/g, '-').toLowerCase()}-content`;

  return (
    <div className="rounded-xl border border-lineSoft/60 bg-panel/30 text-xs overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full flex items-center justify-between gap-2 p-2.5 text-left"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">
          <Icon path={icon} size={13} />
          {title}
        </span>
        <Icon
          path={icons.chevronDown}
          size={16}
          className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div id={contentId} className="overflow-hidden">
          <div className="px-2.5 pb-2.5 flex flex-col gap-1.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface MerchantSummaryProps {
  merchant?: string | undefined;
  description?: string | undefined;
  customerName?: string | undefined;
  customerEmail?: string | undefined;
  customerMobileNumber?: string | undefined;
  items?: OrderItem[] | undefined;
  currency?: string | undefined;
  subtotal: string;
  fee: string;
  total: string;
}

export default function MerchantSummary({
  merchant,
  description,
  customerName,
  customerEmail,
  customerMobileNumber,
  items,
  currency = 'IDR',
  subtotal,
  fee,
  total,
}: Readonly<MerchantSummaryProps>) {
  return (
    <div className="rounded-xl2 border border-lineSoft bg-panel2/40 p-3 my-2 flex flex-col gap-2">
      {merchant && <Row label="Merchant" value={merchant} />}
      {description && !items?.length && <Row label="Description" value={description} />}

      {(customerName ?? customerEmail ?? customerMobileNumber) && (
        <CollapsibleSection icon={icons.user} title="Customer Details">
          {customerName && (
            <div className="flex justify-between">
              <span className="text-muted">Name</span>
              <span className="text-text font-medium">{customerName}</span>
            </div>
          )}
          {customerEmail && (
            <div className="flex justify-between">
              <span className="text-muted">Email</span>
              <span className="text-text font-medium truncate max-w-[180px]">{customerEmail}</span>
            </div>
          )}
          {customerMobileNumber && (
            <div className="flex justify-between">
              <span className="text-muted">Mobile</span>
              <span className="text-text font-medium">{customerMobileNumber}</span>
            </div>
          )}
        </CollapsibleSection>
      )}

      {items && items.length > 0 && (
        <CollapsibleSection icon={icons.receipt} title={`Order Items (${items.length})`}>
          <div className="flex flex-col gap-1.5 divide-y divide-lineSoft/40 max-h-24 overflow-y-auto">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="pt-1.5 first:pt-0 flex flex-col gap-0.5">
                <div className="flex justify-between items-start font-medium text-text">
                  <span>
                    {item.name} <span className="text-muted text-[10px]">x{item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.price * item.quantity, currency)}</span>
                </div>
                {item.description && (
                  <span className="text-[10px] text-muted leading-tight">{item.description}</span>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      <div className="h-px bg-lineSoft" />
      <Row label="Subtotal" value={subtotal} />
      <Row label="Admin fee" value={fee} />
      <div className="h-px bg-lineSoft" />
      <Row label="Total" value={total} strong />
    </div>
  );
}
