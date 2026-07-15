import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function VaBox({ number, onCopy }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between rounded-xl2 border border-dashed border-brand/20 bg-panel2 px-5 py-4 mb-5 shadow-inner">
      <div>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-1 font-sans">Virtual Account Number</p>
        <p className="font-mono text-xl font-bold tracking-widest text-brand">{number}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 border transition-all duration-150 ${
          copied
            ? 'bg-brand/20 text-brand border-brand/30'
            : 'bg-panel text-text border-lineSoft hover:border-brand/50 hover:text-brand'
        }`}
      >
        {copied ? (
          <>
            <Check size={13} />
            Copied
          </>
        ) : (
          <>
            <Copy size={13} />
            Copy
          </>
        )}
      </button>
    </div>
  )
}
