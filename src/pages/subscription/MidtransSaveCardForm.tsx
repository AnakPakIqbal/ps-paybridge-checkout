import { useState } from 'react';

import Button from '../../atoms/Button';
import Input from '../../atoms/Input';
import { formatCardNumber, formatExpiry } from '../../utils/cardInput';
import { registerMidtransCard } from '../../utils/midtransCard';

const CARD_NUMBER_DIGITS = 16;
const EXPIRY_DIGITS = 4;
const MONTH_DIGITS = 2;
const MAX_MONTH = 12;
const CENTURY_PREFIX = '20';

interface MidtransSaveCardFormProps {
  onSaved: (savedTokenId: string) => void;
  onError: (message: string) => void;
  submitLabel: string;
  disabled: boolean;
}

function parseExpiry(expiry: string): { month: string; year: string } | null {
  const digits = expiry.replace(/\D/g, '');
  if (digits.length !== EXPIRY_DIGITS) return null;
  const month = digits.slice(0, MONTH_DIGITS);
  const monthNumber = Number(month);
  if (monthNumber < 1 || monthNumber > MAX_MONTH) return null;
  return { month, year: `${CENTURY_PREFIX}${digits.slice(MONTH_DIGITS)}` };
}

// Saving a card needs only its number and expiry -- deliberately no CVV and no cardholder
// name, since /v2/card/register uses neither. The card goes from this form to Midtrans's own
// SDK and never to PayBridge; all this component ever hands upward is the resulting token.
export default function MidtransSaveCardForm({
  onSaved,
  onError,
  submitLabel,
  disabled,
}: Readonly<MidtransSaveCardFormProps>) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  const parsedExpiry = parseExpiry(expiry);
  const numberDigits = number.replace(/\s/g, '').length;
  const valid = numberDigits === CARD_NUMBER_DIGITS && parsedExpiry !== null;

  const handleSubmit = async () => {
    if (!valid) return;

    setSaving(true);
    try {
      const savedTokenId = await registerMidtransCard({
        number,
        expiryMonth: parsedExpiry.month,
        expiryYear: parsedExpiry.year,
      });
      onSaved(savedTokenId);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'This card could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <Input
        label="Card number"
        placeholder="4121 2345 6789 0123"
        value={number}
        onChange={(event) => {
          setNumber(formatCardNumber(event.target.value));
        }}
        inputMode="numeric"
        autoComplete="cc-number"
        disabled={saving || disabled}
        progress={numberDigits / CARD_NUMBER_DIGITS}
      />
      <Input
        label="Expiry date"
        placeholder="MM/YY"
        value={expiry}
        onChange={(event) => {
          setExpiry(formatExpiry(event.target.value));
        }}
        inputMode="numeric"
        autoComplete="cc-exp"
        disabled={saving || disabled}
        progress={expiry.replace(/\D/g, '').length / EXPIRY_DIGITS}
      />
      <Button type="submit" disabled={!valid || saving || disabled}>
        {saving ? 'Saving card…' : submitLabel}
      </Button>
    </form>
  );
}
