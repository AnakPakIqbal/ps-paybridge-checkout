import CollapsibleDetails from './CollapsibleDetails';

interface PortalSidebarProps {
  merchantName: string;
  type: 'subscription' | 'refund';
  orderReference?: string;
}

export default function PortalSidebar({
  merchantName,
  type,
  orderReference,
}: Readonly<PortalSidebarProps>) {
  const merchantInitial = merchantName ? merchantName.charAt(0).toUpperCase() : 'M';

  return (
    <aside className="flex flex-col gap-5 w-full">
      {/* Merchant Trust Profile Card */}
      <div>
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

        <CollapsibleDetails title="Details" className="pt-3 border-t border-lineSoft/80">
          <div className="space-y-2.5 pt-3 text-xs">
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
        </CollapsibleDetails>
      </div>

      {/* Merchant Help Guidance */}
      <div className="text-center text-xs text-muted">
        <p className="font-semibold text-text mb-1">Need help or inquiries?</p>
        <p className="text-[11px] leading-relaxed">
          Contact <strong className="text-text">{merchantName}</strong> directly for order support
          or to change your plan.
        </p>
      </div>
    </aside>
  );
}
