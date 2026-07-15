import { forwardRef } from 'react'

const Button = forwardRef(function Button({ children, className = '', variant = 'primary', ...props }, ref) {
  const base = 'w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm py-4 transition-transform duration-150 active:scale-[0.99]'
  const variants = {
    primary: 'bg-brand text-black hover:bg-brand/90',
    ghost: 'bg-panel2 text-text border border-lineSoft hover:border-brand/50'
  }
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
})

export default Button
