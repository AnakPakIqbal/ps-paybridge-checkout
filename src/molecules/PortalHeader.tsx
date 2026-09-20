import paybridgeLogo from '../assets/images/paybridge-logo.png';
import Badge from '../atoms/Badge';

interface PortalHeaderProps {
  merchantName?: string | undefined;
  portalType?: 'subscription' | 'refund' | 'checkout' | 'portal' | undefined;
}

function getPortalTypeLabel(
  type: 'subscription' | 'refund' | 'checkout' | 'portal' | undefined,
): string {
  if (type === 'subscription') return 'Subscription Portal';
  if (type === 'refund') return 'Refund Portal';
  if (type === 'checkout') return 'Secure Checkout';
  return 'Customer Portal';
}

export default function PortalHeader({
  merchantName,
  portalType = 'portal',
}: Readonly<PortalHeaderProps>) {
  const typeLabel = getPortalTypeLabel(portalType);

  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img
            src={paybridgeLogo}
            alt="PayBridge"
            className="h-8 w-auto bg-white rounded-lg p-1 border border-lineSoft shadow-sm"
          />
          <Badge>{typeLabel}</Badge>
        </div>
        {merchantName && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brandDim text-xs text-brand font-medium border border-brand/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span>{merchantName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-lineSoft shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-text">256-Bit Encrypted</span>
          <span className="text-muted/60">&bull;</span>
          <span className="text-muted">Tokenized Vault</span>
        </div>
      </div>
    </header>
  );
}
