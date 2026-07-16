import type { CSSProperties } from 'react';

import {
  AmexIcon,
  GenericLogoIcon,
  JCBLogoIcon,
  MastercardLogoIcon,
  VisaLogoIcon,
} from 'react-svg-credit-card-payment-icons';

export type CardBrand = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'generic';

function CardChip() {
  return (
    <svg className="w-10 h-8 text-yellow-600/80" viewBox="0 0 40 30" fill="currentColor">
      <rect x="2" y="2" width="36" height="26" rx="4" fill="url(#chip-grad)" />
      <path
        d="M 2 10 L 15 10 M 2 20 L 15 20 M 38 10 L 25 10 M 38 20 L 25 20 M 15 2 L 15 28 M 25 2 L 25 28"
        stroke="#3d2a04"
        strokeWidth="1"
        fill="none"
      />
      <rect
        x="15"
        y="10"
        width="10"
        height="10"
        rx="1.5"
        stroke="#3d2a04"
        strokeWidth="1"
        fill="none"
      />
      <defs>
        <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe082" />
          <stop offset="50%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BrandLogo({ brand }: Readonly<{ brand: CardBrand }>) {
  if (brand === 'visa') return <VisaLogoIcon width={44} />;
  if (brand === 'mastercard') return <MastercardLogoIcon width={36} />;
  if (brand === 'jcb') return <JCBLogoIcon width={36} />;
  if (brand === 'amex') return <AmexIcon width={36} />;
  return <GenericLogoIcon width={36} />;
}

export function getCardBrand(num: string): CardBrand {
  const clean = (num || '').replace(/\s/g, '');
  if (clean.startsWith('4')) return 'visa';
  if (clean.startsWith('5') || clean.startsWith('2')) return 'mastercard';
  if (clean.startsWith('35')) return 'jcb';
  if (clean.startsWith('34') || clean.startsWith('37')) return 'amex';
  return 'generic';
}

const SIDE_STYLE: CSSProperties = {
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
};

interface VirtualCardProps {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  flipped: boolean;
}

export default function VirtualCard({
  number,
  name,
  expiry,
  cvv,
  flipped,
}: Readonly<VirtualCardProps>) {
  const brand = getCardBrand(number);

  return (
    <div
      className="relative w-full max-w-[360px] aspect-[1.586/1] select-none"
      style={{ perspective: '1000px' }}
    >
      <div
        className="w-full h-full relative"
        style={{
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* FRONT SIDE */}
        <div
          className="rounded-xl2 border border-white/10 bg-gradient-to-br from-[#0b2a7a] via-[#1f5fd6] to-[#38b6ff] p-5 sm:p-6 shadow-xl shadow-brand/20 flex flex-col justify-between"
          style={SIDE_STYLE}
        >
          {/* Decorative premium card graphics */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

          {/* Top row: Chip & Logo */}
          <div className="flex justify-between items-start">
            <CardChip />
            <div className="h-8 flex items-center justify-end">
              <BrandLogo brand={brand} />
            </div>
          </div>

          {/* Middle row: Card Number */}
          <div className="font-mono text-base sm:text-lg tracking-[0.2em] text-white font-semibold select-all my-2">
            {number}
          </div>

          {/* Bottom row: Cardholder & Expiry */}
          <div className="flex justify-between text-[10px] uppercase tracking-wider mt-2">
            <div className="max-w-[70%]">
              <p className="text-[8px] text-white/60 mb-0.5 tracking-widest font-sans">
                Cardholder Name
              </p>
              <p className="text-white text-xs sm:text-sm font-mono tracking-wide truncate">
                {name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/60 mb-0.5 tracking-widest font-sans">Expires</p>
              <p className="text-white text-xs sm:text-sm font-mono tracking-wide">{expiry}</p>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className="rounded-xl2 border border-white/10 bg-gradient-to-br from-[#0b2a7a] via-[#1f5fd6] to-[#38b6ff] py-5 sm:py-6 shadow-xl shadow-brand/20 flex flex-col justify-between overflow-hidden"
          style={{
            ...SIDE_STYLE,
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Decorative premium card graphics */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

          {/* Magnetic Strip */}
          <div className="w-full h-9 bg-black/80 mt-1" />

          {/* Signature & CVV Strip */}
          <div className="px-5 sm:px-6">
            <p className="text-[7px] text-white/60 mb-1 tracking-widest uppercase font-sans">
              Authorized Signature
            </p>
            <div className="flex items-center gap-3">
              {/* Textured white strip */}
              <div className="flex-1 bg-[repeating-linear-gradient(45deg,#e4eaf6,#e4eaf6_2px,#d7e0f0_2px,#d7e0f0_4px)] border border-white/20 h-8 rounded" />
              {/* CVV display block - Securely masked to hide CVV digits */}
              <div className="bg-white text-text font-mono text-sm px-3 py-1 rounded h-8 flex items-center justify-center font-bold tracking-widest min-w-[50px] shadow-inner">
                {cvv ? cvv.replace(/./g, '•') : '•••'}
              </div>
            </div>
          </div>

          {/* Bottom row: Info & Logo */}
          <div className="flex justify-between items-center px-5 sm:px-6 mt-2">
            <p className="text-[7px] text-white/50 leading-tight max-w-[65%] font-sans">
              This card is a digital representation of your tokenized credit credentials.
            </p>
            <div className="h-6 flex items-center">
              <BrandLogo brand={brand} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
