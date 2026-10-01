interface PortalSidebarProps {
  merchantName: string;
}

export default function PortalSidebar({ merchantName }: Readonly<PortalSidebarProps>) {
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
            <p className="text-sm text-muted">Merchant on PayBridge</p>
          </div>
        </div>
      </div>

      {/* Merchant Help Guidance */}
      <div className="text-center text-sm text-muted">
        <p className="font-semibold text-text mb-1">Need help or inquiries?</p>
        <p className="text-xs leading-relaxed">
          Contact <strong className="text-text">{merchantName}</strong> directly for order support
          or to change your plan.
        </p>
      </div>
    </aside>
  );
}
