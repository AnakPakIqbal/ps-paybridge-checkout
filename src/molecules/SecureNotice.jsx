import Icon, { icons } from '../atoms/Icon.jsx'

export default function SecureNotice({ title, subtitle }) {
  return (
    <div className="flex items-center gap-3 rounded-xl2 border border-lineSoft bg-panel2/50 px-5 py-4">
      <div className="w-9 h-9 rounded-lg bg-panel flex items-center justify-center text-muted flex-shrink-0">
        <Icon path={icons.lock} size={16} />
      </div>
      <div>
        <p className="text-sm text-text font-medium">{title}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  )
}
