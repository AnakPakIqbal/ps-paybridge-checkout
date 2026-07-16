import gsap from 'gsap';
import { useEffect, useRef } from 'react';

interface TracedBorderProps {
  /** 0 to 1 — how much of the rectangle's perimeter should be stroked in. */
  progress: number;
  className?: string;
}

export default function TracedBorder({ progress, className = '' }: Readonly<TracedBorderProps>) {
  const rectRef = useRef<SVGRectElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const snapToCurrentSize = () => {
    const rect = rectRef.current;
    if (!rect) return;
    const length = rect.getTotalLength();
    const clamped = Math.max(0, Math.min(1, progressRef.current));
    gsap.set(rect, { strokeDasharray: length, strokeDashoffset: length * (1 - clamped) });
  };

  useEffect(() => {
    const rect = rectRef.current;
    if (!rect) return;

    snapToCurrentSize();

    const resizeObserver = new ResizeObserver(snapToCurrentSize);
    resizeObserver.observe(rect.ownerSVGElement ?? rect);

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const rect = rectRef.current;
    if (!rect) return;
    const length = rect.getTotalLength();
    const clamped = Math.max(0, Math.min(1, progress));
    gsap.to(rect, {
      strokeDashoffset: length * (1 - clamped),
      duration: 0.35,
      ease: 'power2.out',
    });
  }, [progress]);

  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full overflow-visible ${className}`}
      aria-hidden="true"
    >
      <rect
        ref={rectRef}
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        rx="11"
        fill="none"
        stroke="#1f5fd6"
        strokeWidth="1.5"
      />
    </svg>
  );
}
