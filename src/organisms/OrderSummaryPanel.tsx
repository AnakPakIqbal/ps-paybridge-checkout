import { useState } from 'react';

import type { CheckoutSession } from '../types/checkout';

import paybridgeLogo from '../assets/images/paybridge-logo.png';
import AmountDisplay from '../molecules/AmountDisplay';
import ComplianceStrip from '../molecules/ComplianceStrip';
import MerchantSummary from '../molecules/MerchantSummary';
import { formatCurrency } from '../utils/formatCurrency';

interface OrderSummaryPanelProps {
  session: CheckoutSession | null;
}

interface FaqItem {
  question: string;
  answer: string;
}

const CHECKOUT_FAQS: FaqItem[] = [
  {
    question: 'When is my payment confirmed?',
    answer:
      'Immediately upon authorization from your bank, card issuer, or e-wallet provider. This page will update automatically.',
  },
  {
    question: 'Are my card details stored by PayBridge?',
    answer:
      'No. Card details go straight from your browser to the licensed payment gateway (Stripe, Midtrans, or Xendit). PayBridge never stores raw card data.',
  },
  {
    question: 'Are there any hidden fees?',
    answer:
      'No hidden fees. The amount displayed is the exact total charged to your selected payment method.',
  },
];

export default function OrderSummaryPanel({ session }: Readonly<OrderSummaryPanelProps>) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const amountStr = session ? formatCurrency(session.amount, session.currency) : 'Rp 0';
  const reference = session ? session.orderId : '...';
  const description = session?.description ?? 'Checkout Order';
  const subtotal = amountStr;
  const fee = session ? formatCurrency(0, session.currency) : 'Rp 0';
  const merchantName = session?.merchant?.name ?? 'Merchant';
  const merchantInitial = merchantName.charAt(0).toUpperCase();

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Merchant Trust Profile Card */}
      <div className="bg-panel2/70 border border-lineSoft rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brandSoft/60 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {merchantInitial}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-text">{merchantName}</h3>
                <span
                  title="Verified Merchant"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand text-white text-[10px]"
                >
                  ✓
                </span>
              </div>
              <p className="text-xs text-muted">Verified Merchant</p>
            </div>
          </div>
          <img
            src={paybridgeLogo}
            alt="PayBridge"
            className="h-6 w-auto bg-white rounded-md p-1 border border-lineSoft shadow-2xs"
          />
        </div>

        <div className="space-y-2.5 pt-3 border-t border-lineSoft/80 text-xs">
          <div className="flex items-center justify-between text-muted">
            <span>Portal Type</span>
            <span className="text-text font-medium">Secure Checkout</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Reference</span>
            <span className="text-text font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-lineSoft truncate max-w-[170px]">
              {reference}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Payment Security</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tokenized Vault (PCI-DSS)
            </span>
          </div>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-panel border border-lineSoft rounded-2xl p-5 shadow-xs">
        <AmountDisplay amount={amountStr} reference={reference} />
        <div className="mt-3">
          <MerchantSummary
            merchant={session?.merchant?.name}
            description={description}
            customerName={session?.customerName}
            customerEmail={session?.customerEmail}
            customerMobileNumber={session?.customerMobileNumber}
            items={session?.items}
            currency={session?.currency}
            subtotal={subtotal}
            fee={fee}
            total={amountStr}
          />
        </div>
      </div>

      {/* Why This Is Secure (Factual, matching refund & subscription) */}
      <div className="bg-gradient-to-br from-brandDim/50 to-panel border border-brand/20 rounded-2xl p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand mb-3 flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-brand"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Why This Is Secure
        </h4>
        <ul className="space-y-2 text-xs text-muted">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>Card details go straight to the payment provider, never to PayBridge.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>This checkout session link is unique and expires.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>3-D Secure authentication supported by your issuing bank.</span>
          </li>
        </ul>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="bg-panel2/50 border border-lineSoft rounded-2xl p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text mb-3 flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Frequently Asked Questions
        </h4>
        <div className="divide-y divide-lineSoft/60">
          {CHECKOUT_FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={faq.question} className="py-2.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => {
                    toggleFaq(index);
                  }}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-text hover:text-brand transition-colors gap-2"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className="text-muted text-sm shrink-0">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p className="mt-1.5 text-xs text-muted leading-relaxed transition-all">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ComplianceStrip />
    </div>
  );
}
