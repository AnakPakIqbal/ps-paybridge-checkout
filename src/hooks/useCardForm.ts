import { useState } from 'react';

import { getCardBrand } from '../molecules/VirtualCard';

export interface CardDetails {
  number: string;
  firstName: string;
  lastName: string;
  expiry: string;
  cvv: string;
}

export function isCardFormComplete(details: CardDetails): boolean {
  const { number, firstName, lastName, expiry, cvv } = details;
  const cvvLength = getCardBrand(number) === 'amex' ? 4 : 3;
  return (
    number.replace(/\s/g, '').length === 16 &&
    expiry.replace(/\D/g, '').length === 4 &&
    cvv.length === cvvLength &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0
  );
}

const EMPTY_CARD_DETAILS: CardDetails = {
  number: '',
  firstName: '',
  lastName: '',
  expiry: '',
  cvv: '',
};

export function useCardForm() {
  const [details, setDetails] = useState<CardDetails>(EMPTY_CARD_DETAILS);

  const updateField = <TField extends keyof CardDetails>(
    field: TField,
    value: CardDetails[TField],
  ) => {
    setDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setDetails(EMPTY_CARD_DETAILS);
  };

  return {
    details,
    updateField,
    resetForm,
  };
}
