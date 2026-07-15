import Icon, { icons } from '../atoms/Icon.jsx'
import Badge from '../atoms/Badge.jsx'

export default function BrandMark() {
  return (
    <div className="flex flex-col gap-3 pb-6 border-b border-lineSoft">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brandDim border border-brand/30 flex items-center justify-center text-brand">
          <Icon path={icons.shieldCheck} size={18} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text">PayBridge</span>
          <Badge>Secure Checkout</Badge>
        </div>
      </div>
      <p className="text-sm text-muted">Your payment is protected</p>
    </div>
  )
}
