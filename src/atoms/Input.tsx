import type { InputHTMLAttributes } from 'react';

import { forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className = '', ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm text-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full bg-panel2 border border-lineSoft rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/60 outline-none transition-colors duration-150 focus:border-brand/60 ${className}`}
        {...props}
      />
    </div>
  );
});

export default Input;
