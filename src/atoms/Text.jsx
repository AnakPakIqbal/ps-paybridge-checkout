export function Eyebrow({ children, className = '' }) {
  return (
    <div className={`text-xs uppercase tracking-wider text-muted ${className}`}>
      {children}
    </div>
  )
}

export function Muted({ children, className = '' }) {
  return <p className={`text-sm text-muted ${className}`}>{children}</p>
}

export function Heading({ children, className = '' }) {
  return <h2 className={`text-sm font-semibold text-text ${className}`}>{children}</h2>
}
