import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

import type { CardDetails } from '../hooks/useCardForm';

import Input from '../atoms/Input';
import VirtualCard, { getCardBrand } from '../molecules/VirtualCard';

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

interface CardFormProps {
  details: CardDetails;
  onUpdateField: <TField extends keyof CardDetails>(
    field: TField,
    value: CardDetails[TField],
  ) => void;
  hidePreview?: boolean;
}

type FocusedField = keyof CardDetails | null;

export default function CardForm({
  details,
  onUpdateField,
  hidePreview = false,
}: Readonly<CardFormProps>) {
  const { number, firstName, lastName, expiry, cvv } = details;
  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  const displayNumber = (
    number
      .replace(/\s/g, '')
      .padEnd(16, '•')
      .match(/.{1,4}/g) ?? []
  ).join(' ');
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const cvvLength = getCardBrand(number) === 'amex' ? 4 : 3;

  const hasStartedTyping = !hidePreview && Boolean(number || firstName || lastName || expiry || cvv);

  // 3D slide, spin and scale entry animation on typing start, hide on empty
  useEffect(() => {
    if (hasStartedTyping) {
      gsap.killTweensOf(cardPreviewRef.current);
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
        display: 'flex',
      });
    } else {
      gsap.killTweensOf(cardPreviewRef.current);
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
        display: 'none',
      });
    }
  }, [hasStartedTyping]);

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
          onChange={(event) => {
            onUpdateField('number', formatCardNumber(event.target.value));
          }}
          onFocus={() => {
            setFocusedField('number');
          }}
          onBlur={() => {
            setFocusedField(null);
          }}
          inputMode="numeric"
          progress={number.replace(/\s/g, '').length / 16}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expiry Date"
            placeholder="MM / YY"
            value={expiry}
            onChange={(event) => {
              onUpdateField('expiry', formatExpiry(event.target.value));
            }}
            onFocus={() => {
              setFocusedField('expiry');
            }}
            onBlur={() => {
              setFocusedField(null);
            }}
            inputMode="numeric"
            progress={expiry.replace(/\D/g, '').length / 4}
          />
          <Input
            label="CVV"
            placeholder={'•'.repeat(cvvLength)}
            value={cvv}
            onChange={(event) => {
              onUpdateField('cvv', event.target.value.replace(/\D/g, '').slice(0, cvvLength));
            }}
            onFocus={() => {
              setFocusedField('cvv');
            }}
            onBlur={() => {
              setFocusedField(null);
            }}
            inputMode="numeric"
            type="password"
            progress={cvv.length / cvvLength}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="e.g. John"
            value={firstName}
            onChange={(event) => {
              onUpdateField('firstName', event.target.value);
            }}
            onFocus={() => {
              setFocusedField('firstName');
            }}
            onBlur={() => {
              setFocusedField(null);
            }}
            progress={
              focusedField !== 'firstName' && firstName.trim().length > 0
                ? 1
                : firstName.trim().length / 12
            }
          />
          <Input
            label="Last Name"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(event) => {
              onUpdateField('lastName', event.target.value);
            }}
            onFocus={() => {
              setFocusedField('lastName');
            }}
            onBlur={() => {
              setFocusedField(null);
            }}
            progress={
              focusedField !== 'lastName' && lastName.trim().length > 0
                ? 1
                : lastName.trim().length / 12
            }
          />
        </div>
      </div>
    </div>
  );
}
