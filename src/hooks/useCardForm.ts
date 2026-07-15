import { useState } from 'react';

export interface CardDetails {
  number: string;
  firstName: string;
  lastName: string;
  expiry: string;
  cvv: string;
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
