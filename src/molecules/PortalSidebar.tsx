import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface PortalSidebarProps {
  merchantName: string;
  type: 'subscription' | 'refund';
  orderReference?: string;
}

const SUBSCRIPTION_FAQS: FaqItem[] = [
  {
    question: 'How do subscription renewals work?',
    answer:
      'Your saved card is billed automatically on each scheduled billing date. The next payment date is shown on this page.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. Cancelling stops billing immediately and cannot be undone, so you would need a new link from the merchant to subscribe again. Payments already made are not refunded. If this page has no cancel button, ask the merchant to cancel for you.',
  },
  {
    question: 'Is my card information kept secure?',
    answer:
      'Your card details are entered directly with the payment provider (Stripe, Xendit or Midtrans) and never reach PayBridge. PayBridge only keeps a token that lets the merchant bill your card on schedule, never the card number.',
  },
];

const REFUND_FAQS: FaqItem[] = [
  {
    question: 'When will the funds appear in my account?',
    answer:
      'The refund is sent to the payment provider as soon as you confirm. How long it then takes to show up depends on your bank or card issuer, and can be several business days.',
  },
  {
    question: 'Where will the refund be credited?',
    answer: 'Back to the original payment method you used at checkout.',
  },
  {
    question: 'Are there any refund processing fees?',
    answer:
      'The refund is for exactly the amount shown on this page. PayBridge does not deduct anything from it.',
  },
];

// Why this is secure -- each point is something the system actually does.
const PROTECTION_POINTS: Record<PortalSidebarProps['type'], string[]> = {
  subscription: [
    'Your card details go straight to the payment provider, never to PayBridge.',
    'This link works for this one subscription only, and it expires.',
    'Your bank may ask you to confirm the card with 3-D Secure.',
  ],
  refund: [
    'You are refunding exactly the amount shown, to your original payment method.',
    'This link works for this one refund only, and it expires.',
    'No card details are asked for or stored on this page.',
  ],
};

export default function PortalSidebar({
  merchantName,
  type,
  orderReference,
}: Readonly<PortalSidebarProps>) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const faqs = type === 'subscription' ? SUBSCRIPTION_FAQS : REFUND_FAQS;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((current) => (current === index ? null : index));
  };

  const merchantInitial = merchantName ? merchantName.charAt(0).toUpperCase() : 'M';

  return (
    <aside className="flex flex-col gap-5 w-full">
      {/* Merchant Trust Profile Card */}
      <div className="bg-panel2/70 border border-lineSoft rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brandSoft/60 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            {merchantInitial}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-text">{merchantName}</h3>
            </div>
            <p className="text-xs text-muted">Merchant on PayBridge</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-3 border-t border-lineSoft/80 text-xs">
          <div className="flex items-center justify-between text-muted">
            <span>Portal Type</span>
            <span className="text-text font-medium capitalize">{type} Portal</span>
          </div>
          {orderReference && (
            <div className="flex items-center justify-between text-muted">
              <span>Reference</span>
              <span className="text-text font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-lineSoft">
                {orderReference}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-muted">
            <span>Card data</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Not stored by PayBridge
            </span>
          </div>
        </div>
      </div>

      {/* Reassurance Guarantees Card */}
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
          Why this is secure
        </h4>
        <ul className="space-y-2 text-xs text-muted">
          {PROTECTION_POINTS[type].map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
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
          {faqs.map((faq, index) => {
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

      {/* Merchant Help Guidance */}
      <div className="p-4 rounded-xl bg-white border border-lineSoft text-center text-xs text-muted">
        <p className="font-semibold text-text mb-1">Need help or inquiries?</p>
        <p className="text-[11px] leading-relaxed">
          Contact <strong className="text-text">{merchantName}</strong> directly for order support
          or to change your plan.
        </p>
      </div>
    </aside>
  );
}
