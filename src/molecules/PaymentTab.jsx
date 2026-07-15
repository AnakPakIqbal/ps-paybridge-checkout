import Icon from '../atoms/Icon.jsx'

export default function PaymentTab({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition-colors duration-150 ${
        active
          ? 'border-brand text-text bg-brandDim/40'
          : 'border-lineSoft text-muted bg-panel2 hover:border-line'
      }`}
    >
      <Icon path={icon} size={16} />
      {label}
    </button>
  )
}
