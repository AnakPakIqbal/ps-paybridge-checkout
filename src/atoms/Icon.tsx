interface IconProps {
  path: string;
  size?: number;
  className?: string;
}

export default function Icon({ path, size = 16, className = '' }: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d={path} />
    </svg>
  );
}
