import type { ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = '' }: Readonly<TextProps>) {
  return (
    <div className={`text-xs uppercase tracking-wider text-muted ${className}`}>{children}</div>
  );
}
