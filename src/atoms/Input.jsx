import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm text-text">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-panel2 border border-lineSoft rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/60 outline-none transition-colors duration-150 focus:border-brand/60 ${className}`}
        {...props}
      />
    </div>
  )
})

export default Input
