import React from 'react'

function CardChip() {
  return (
    <svg className="w-10 h-8 text-yellow-600/80" viewBox="0 0 40 30" fill="currentColor">
      <rect x="2" y="2" width="36" height="26" rx="4" fill="url(#chip-grad)" />
      <path d="M 2 10 L 15 10 M 2 20 L 15 20 M 38 10 L 25 10 M 38 20 L 25 20 M 15 2 L 15 28 M 25 2 L 25 28" stroke="#3d2a04" strokeWidth="1" fill="none" />
      <rect x="15" y="10" width="10" height="10" rx="1.5" stroke="#3d2a04" strokeWidth="1" fill="none" />
      <defs>
        <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe082" />
          <stop offset="50%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function BrandLogo({ brand }) {
  if (brand === 'visa') {
    return (
      <svg className="h-5 text-white fill-current" viewBox="0 0 36 12">
        <path d="M14.07 0.3L9.67 11.7H6.77L4.17 2.7C4.07 2.3 3.77 1.9 3.37 1.7C2.57 1.3 1.27 0.9 0.17 0.7L0.27 0.3H4.87C5.47 0.3 6.07 0.7 6.17 1.4L7.37 7.9L11.17 0.3H14.07ZM26.47 7.9C26.47 5.1 22.57 4.9 22.57 3.5C22.57 3.1 22.97 2.6 23.97 2.5C24.47 2.4 25.77 2.3 26.57 2.7L27.07 0.5C25.87 0.1 24.37 0 23.17 0C20.37 0 18.37 1.5 18.27 3.6C18.27 5.2 19.67 6.1 20.77 6.6C21.87 7.1 22.27 7.5 22.27 8C22.27 8.7 21.47 9.1 20.67 9.1C19.27 9.1 18.47 8.7 17.87 8.4L17.37 10.7C17.97 11 19.47 11.2 20.87 11.2C23.77 11.3 26.47 9.9 26.47 7.9ZM35.87 0.3L33.57 11.7H30.97L33.27 0.3H35.87ZM17.47 0.3L15.37 11.7H12.77L14.87 0.3H17.47Z" />
      </svg>
    )
  }
  if (brand === 'mastercard') {
    return (
      <svg className="h-7" viewBox="0 0 24 15">
        <circle cx="7" cy="7.5" r="6.5" fill="#eb001b" />
        <circle cx="13" cy="7.5" r="6.5" fill="#ff5f00" fillOpacity="0.85" />
      </svg>
    )
  }
  if (brand === 'jcb') {
    return (
      <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/10">
        <span className="text-[10px] font-bold tracking-wider text-text font-mono">JCB</span>
      </div>
    )
  }
  if (brand === 'amex') {
    return (
      <div className="flex items-center gap-1 bg-[#006fcf] px-2 py-0.5 rounded border border-white/20">
        <span className="text-[9px] font-bold text-white tracking-widest font-mono">AMEX</span>
      </div>
    )
  }
  return (
    <svg className="h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function getCardBrand(num) {
  const clean = (num || '').replace(/\s/g, '')
  if (clean.startsWith('4')) return 'visa'
  if (clean.startsWith('5') || clean.startsWith('2')) return 'mastercard'
  if (clean.startsWith('35')) return 'jcb'
  if (clean.startsWith('34') || clean.startsWith('37')) return 'amex'
  return 'generic'
}

export default function VirtualCard({ number, name, expiry, cvv, flipped }) {
  const brand = getCardBrand(number)

  const sideStyle = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  }

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
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* FRONT SIDE */}
        <div 
          className="rounded-xl2 border border-brand/20 bg-gradient-to-br from-[#121916] via-[#0e1211] to-[#060807] p-5 sm:p-6 shadow-xl shadow-black/50 flex flex-col justify-between"
          style={sideStyle}
        >
          {/* Decorative premium card graphics */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-brandSoft/10 blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

          {/* Top row: Chip & Logo */}
          <div className="flex justify-between items-start">
            <CardChip />
            <div className="h-8 flex items-center justify-end">
              <BrandLogo brand={brand} />
            </div>
          </div>

          {/* Middle row: Card Number */}
          <div className="font-mono text-base sm:text-lg tracking-[0.2em] text-text font-semibold text-shadow-sm select-all my-2">
            {number}
          </div>

          {/* Bottom row: Cardholder & Expiry */}
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted mt-2">
            <div className="max-w-[70%]">
              <p className="text-[8px] text-muted/60 mb-0.5 tracking-widest font-sans">Cardholder Name</p>
              <p className="text-text text-xs sm:text-sm font-mono tracking-wide truncate">{name}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-muted/60 mb-0.5 tracking-widest font-sans">Expires</p>
              <p className="text-text text-xs sm:text-sm font-mono tracking-wide">{expiry}</p>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className="rounded-xl2 border border-brand/20 bg-gradient-to-br from-[#121916] via-[#0e1211] to-[#060807] py-5 sm:py-6 shadow-xl shadow-black/50 flex flex-col justify-between overflow-hidden"
          style={{
            ...sideStyle,
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Decorative premium card graphics */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

          {/* Magnetic Strip */}
          <div className="w-full h-9 bg-black/80 mt-1" />

          {/* Signature & CVV Strip */}
          <div className="px-5 sm:px-6">
            <p className="text-[7px] text-muted/60 mb-1 tracking-widest uppercase font-sans">Authorized Signature</p>
            <div className="flex items-center gap-3">
              {/* Textured white strip */}
              <div className="flex-1 bg-[repeating-linear-gradient(45deg,#232827,#232827_2px,#1c2120_2px,#1c2120_4px)] border border-lineSoft h-8 rounded" />
              {/* CVV display block - Securely masked to hide CVV digits */}
              <div className="bg-white text-black font-mono text-sm px-3 py-1 rounded h-8 flex items-center justify-center font-bold tracking-widest min-w-[50px] shadow-inner">
                {cvv ? cvv.replace(/./g, '•') : '•••'}
              </div>
            </div>
          </div>

          {/* Bottom row: Info & Logo */}
          <div className="flex justify-between items-center px-5 sm:px-6 mt-2">
            <p className="text-[7px] text-muted/50 leading-tight max-w-[65%] font-sans">
              This card is a digital representation of your tokenized credit credentials.
            </p>
            <div className="h-6 flex items-center">
              <BrandLogo brand={brand} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
