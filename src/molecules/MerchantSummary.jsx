function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={strong ? 'text-text font-semibold' : 'text-muted text-sm'}>{label}</span>
      <span className={strong ? 'text-brand font-semibold' : 'text-text text-sm font-medium'}>{value}</span>
    </div>
  )
}

export default function MerchantSummary({ merchant, description, subtotal, fee, total }) {
  return (
    <div className="rounded-xl2 border border-lineSoft bg-panel2/40 px-5 py-2 my-3">
      <Row label="Merchant" value={merchant} />
      <Row label="Description" value={description} />
      <div className="h-px bg-lineSoft my-1" />
      <Row label="Subtotal" value={subtotal} />
      <Row label="Admin fee" value={fee} />
      <div className="h-px bg-lineSoft my-1" />
      <Row label="Total" value={total} strong />
    </div>
  )
}
