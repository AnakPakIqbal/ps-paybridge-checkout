import type { ButtonHTMLAttributes } from 'react';

import { forwardRef } from 'react';

const BASE_CLASSNAME =
  'w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm py-4 transition-transform duration-150 active:scale-[0.99]';

const VARIANT_CLASSNAMES = {
  primary: 'bg-brand text-white hover:bg-brand/90',
  ghost: 'bg-panel2 text-text border border-lineSoft hover:border-brand/50',
};

type ButtonVariant = keyof typeof VARIANT_CLASSNAMES;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className = '', variant = 'primary', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${BASE_CLASSNAME} ${VARIANT_CLASSNAMES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
