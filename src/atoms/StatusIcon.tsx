import gsap from 'gsap';
import { useEffect, useRef } from 'react';

type StatusVariant = 'success' | 'failed' | 'expired' | 'waiting';

interface StatusIconProps {
  variant: StatusVariant;
  size?: number;
}

const VARIANT_COLOR: Record<StatusVariant, string> = {
  success: '#1f5fd6',
  failed: '#ef4444',
  expired: '#eab308',
  waiting: '#1f5fd6',
};

// The inner mark's `d` for each variant, drawn in a 0 0 24 24 viewBox matching the
// outer circle so both paths share one coordinate space. 'waiting' has no mark — its
// ring itself becomes the spinning indicator instead (see the component below).
const VARIANT_MARK: Record<'success' | 'failed' | 'expired', string> = {
  success: 'M7 12.5 L10.5 16 L17 8.5',
  failed: 'M8 8 L16 16 M16 8 L8 16',
  expired: 'M12 7 V12.5 L15.5 15',
};

export default function StatusIcon({ variant, size = 44 }: Readonly<StatusIconProps>) {
  const ringRef = useRef<SVGCircleElement>(null);
  const markRef = useRef<SVGPathElement>(null);
  const spinnerRef = useRef<SVGCircleElement>(null);
  const cometRef = useRef<SVGCircleElement>(null);
  const color = VARIANT_COLOR[variant];

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const ringLength = ring.getTotalLength();
    gsap.set(ring, { strokeDasharray: ringLength, strokeDashoffset: ringLength });
    const timeline = gsap.timeline();
    timeline.to(ring, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' });

    if (variant === 'waiting') {
      const spinner = spinnerRef.current;
      if (spinner) {
        const spinnerLength = spinner.getTotalLength();
        gsap.set(spinner, { strokeDasharray: `${spinnerLength * 0.25} ${spinnerLength}` });
        timeline.to(
          spinner,
          {
            rotation: 360,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'none',
            repeat: -1,
          },
          '-=0.1',
        );
      }
    } else {
      const mark = markRef.current;
      if (mark) {
        const markLength = mark.getTotalLength();
        gsap.set(mark, { strokeDasharray: markLength, strokeDashoffset: markLength });
        timeline.to(mark, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, '-=0.1');
      }

      timeline.to(
        ring,
        { opacity: 0.55, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        '+=0.15',
      );

      const comet = cometRef.current;
      if (comet) {
        gsap.set(comet, { strokeDasharray: `${ringLength * 0.16} ${ringLength}`, opacity: 0 });
        timeline.to(comet, { opacity: 1, duration: 0.2 }, '-=1.4');
        timeline.to(
          comet,
          { rotation: 360, transformOrigin: '50% 50%', duration: 2.8, ease: 'none', repeat: -1 },
          '<',
        );
      }
    }

    return () => {
      timeline.kill();
    };
  }, [variant]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="overflow-visible"
    >
      <circle
        ref={ringRef}
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={variant === 'waiting' ? 0.25 : 1}
      />
      {variant === 'waiting' ? (
        <circle
          ref={spinnerRef}
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            ref={markRef}
            d={VARIANT_MARK[variant]}
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            ref={cometRef}
            cx="12"
            cy="12"
            r="10"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0}
          />
        </>
      )}
    </svg>
  );
}
