import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className = '' }: Readonly<BadgeProps>) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-brandDim text-brand text-xs px-3 py-1 font-medium ${className}`}
    >
      {children}
    </span>
  );
}
