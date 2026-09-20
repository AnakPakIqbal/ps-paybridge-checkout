import type { ButtonHTMLAttributes } from 'react';

import { forwardRef } from 'react';

const BASE_CLASSNAME =
  'flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.99] cursor-pointer';

const SIZE_CLASSNAMES = {
  sm: 'text-xs py-2 px-3.5',
  md: 'text-sm py-2.5 px-4',
  lg: 'w-full text-sm py-4',
};

const VARIANT_CLASSNAMES = {
  danger:
    'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200/80 shadow-2xs',
  ghost: 'bg-panel2 text-text border border-lineSoft hover:border-brand/50 hover:bg-white',
  outline:
    'bg-white text-text border border-lineSoft hover:border-brand/50 hover:bg-slate-50 shadow-2xs',
  primary: 'bg-brand text-white hover:bg-brand/90 shadow-md shadow-brand/10',
};

type ButtonSize = keyof typeof SIZE_CLASSNAMES;
type ButtonVariant = keyof typeof VARIANT_CLASSNAMES;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className = '', size = 'lg', variant = 'primary', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${BASE_CLASSNAME} ${SIZE_CLASSNAMES[size]} ${VARIANT_CLASSNAMES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
