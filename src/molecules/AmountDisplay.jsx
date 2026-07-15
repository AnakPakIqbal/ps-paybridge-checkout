import { Eyebrow } from '../atoms/Text.jsx'

export default function AmountDisplay({ amount, reference }) {
  return (
    <div className="py-4 border-b border-lineSoft">
      <Eyebrow className="mb-1">Amount due</Eyebrow>
      <div className="text-3xl font-bold text-text tracking-tight" id="amount-value">
        {amount}
      </div>
      <p className="text-xs text-muted mt-1">Order ref: {reference}</p>
    </div>
  )
}
