import Icon from '../atoms/Icon';
import { icons } from '../atoms/icons';

// Only things that are true of this system. The card networks' 3-D Secure is run by the
// payment providers, and card details go straight from the customer's browser to the
// provider -- verified: the only bodies PayBridge receives are tokens.
const ASSURANCES = [
  { icon: icons.shieldCheck, label: '3-D Secure supported' },
  { icon: icons.lock, label: 'Card details never reach PayBridge' },
];

export default function PortalFooter() {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12 mt-6 flex flex-col items-center gap-4 text-center text-xs text-muted no-print">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 border-t border-lineSoft text-muted/80">
        {ASSURANCES.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <Icon path={item.icon} size={12} />
            {item.label}
          </div>
        ))}
      </div>
      <p className="text-muted/80">
        Payments are processed by <strong className="text-text">Xendit</strong>,{' '}
        <strong className="text-text">Midtrans</strong> and{' '}
        <strong className="text-text">Stripe</strong>.
      </p>
      <p className="text-muted/60 text-[11px] max-w-xl leading-relaxed">
        PayBridge is powered by{' '}
        <a
          href="https://point-star.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-lineSoft hover:text-text hover:decoration-current transition-colors"
        >
          Point Star
        </a>
        . This page is served over an encrypted (HTTPS) connection. Your card number is handled
        by the payment provider, not by PayBridge, and PayBridge never stores it.
      </p>
    </footer>
  );
}
