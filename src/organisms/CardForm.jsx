import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Input from '../atoms/Input.jsx'
import VirtualCard from '../molecules/VirtualCard.jsx'

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export default function CardForm({ details, onUpdateField }) {
  const { number, firstName, lastName, expiry, cvv } = details
  const cardPreviewRef = useRef(null)
  const [focusedField, setFocusedField] = useState(null)

  const displayNumber = (number.replace(/\s/g, '').padEnd(16, '•').match(/.{1,4}/g) || []).join(' ')
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  const hasStartedTyping = !!(number || firstName || lastName || expiry || cvv)

  // 3D slide, spin and scale entry animation on typing start, hide on empty
  useEffect(() => {
    if (hasStartedTyping) {
      gsap.killTweensOf(cardPreviewRef.current)
      gsap.to(cardPreviewRef.current, {
        height: window.innerWidth >= 640 ? 244 : 218, // matches dynamic heights of the new aspect ratio card
        opacity: 1,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        y: 0,
        marginBottom: 20,
        duration: 0.6,
        ease: 'back.out(1.2)',
        display: 'flex'
      })
    } else {
      gsap.killTweensOf(cardPreviewRef.current)
      gsap.to(cardPreviewRef.current, {
        height: 0,
        opacity: 0,
        scale: 0.8,
        rotateX: 20,
        rotateY: -30,
        y: 15,
        marginBottom: 0,
        duration: 0.45,
        ease: 'power2.inOut',
        display: 'none'
      })
    }
  }, [hasStartedTyping])

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Glassmorphic Card Preview - Hidden at init, slides in on typing, flips on CVV focus */}
      <div 
        ref={cardPreviewRef} 
        className="w-full flex justify-center origin-center overflow-hidden"
        style={{ display: 'none', height: 0, opacity: 0 }}
      >
        <VirtualCard
          number={number ? displayNumber : '•••• •••• •••• ••••'}
          name={fullName ? fullName.toUpperCase() : 'CARDHOLDER NAME'}
          expiry={expiry || 'MM/YY'}
          cvv={cvv}
          flipped={focusedField === 'cvv'}
        />
      </div>

      {/* Styled Input Fields */}
      <div className="flex flex-col gap-4">
        <Input
          label="Card Number"
          placeholder="4121 2345 6789 0123"
          value={number}
          onChange={e => onUpdateField('number', formatCardNumber(e.target.value))}
          onFocus={() => setFocusedField('number')}
          onBlur={() => setFocusedField(null)}
          inputMode="numeric"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expiry Date"
            placeholder="MM / YY"
            value={expiry}
            onChange={e => onUpdateField('expiry', formatExpiry(e.target.value))}
            onFocus={() => setFocusedField('expiry')}
            onBlur={() => setFocusedField(null)}
            inputMode="numeric"
          />
          <Input
            label="CVV"
            placeholder="•••"
            value={cvv}
            onChange={e => onUpdateField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            onFocus={() => setFocusedField('cvv')}
            onBlur={() => setFocusedField(null)}
            inputMode="numeric"
            type="password"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="e.g. John"
            value={firstName}
            onChange={e => onUpdateField('firstName', e.target.value)}
            onFocus={() => setFocusedField('firstName')}
            onBlur={() => setFocusedField(null)}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={e => onUpdateField('lastName', e.target.value)}
            onFocus={() => setFocusedField('lastName')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
      </div>
    </div>
  )
}
