import type { InputHTMLAttributes } from 'react';

import { forwardRef, useId } from 'react';

import TracedBorder from './TracedBorder';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** 0 to 1 — how much of the field's expected length is filled in. */
  progress?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className = '', progress = 0, ...props },
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
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-panel2 border border-transparent rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/60 outline-none transition-colors duration-150 ${className}`}
          {...props}
        />
        <TracedBorder progress={progress} />
      </div>
    </div>
  );
});

export default Input;
