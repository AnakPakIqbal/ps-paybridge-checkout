import type { SaveCardPreparation } from '../../types/subscription';

import StripeCardElement from '../../organisms/cards/stripe/StripeCardElement';
import XenditCardComponent from '../../organisms/cards/xendit/XenditCardComponent';
import { PSP_PROVIDER } from '../../types/checkout';
import MidtransSaveCardForm from './MidtransSaveCardForm';

const SAVE_CARD_LABEL = 'Save card and subscribe';

interface SaveCardStepProps {
  prepared: SaveCardPreparation;
  // Called once the provider has the card. Midtrans passes the token its SDK returned;
  // Stripe and Xendit pass nothing, because the server resolves theirs from the session.
  onCardSaved: (savedTokenId?: string) => void;
  onError: (message: string) => void;
  disabled: boolean;
}

// Each provider draws its own card entry, and none of them ever gives PayBridge the card:
// Stripe and Xendit render iframes, Midtrans's SDK talks to Midtrans directly. This picks
// the right one for the provider the merchant chose for the plan.
export default function SaveCardStep({
  prepared,
  onCardSaved,
  onError,
  disabled,
}: Readonly<SaveCardStepProps>) {
  if (prepared.provider === PSP_PROVIDER.STRIPE && prepared.clientSecret) {
    return (
      <StripeCardElement
        clientSecret={prepared.clientSecret}
        intent="setup"
        submitLabel={SAVE_CARD_LABEL}
        onComplete={() => {
          onCardSaved();
        }}
        onError={onError}
      />
    );
  }

  if (prepared.provider === PSP_PROVIDER.XENDIT && prepared.componentsSdkKey) {
    return (
      <XenditCardComponent
        componentsSdkKey={prepared.componentsSdkKey}
        submitLabel={SAVE_CARD_LABEL}
        onComplete={() => {
          onCardSaved();
        }}
        onError={onError}
      />
    );
  }

  if (prepared.provider === PSP_PROVIDER.MIDTRANS) {
    return (
      <MidtransSaveCardForm
        submitLabel={SAVE_CARD_LABEL}
        disabled={disabled}
        onSaved={onCardSaved}
        onError={onError}
      />
    );
  }

  // A provider the server prepared but the page cannot draw: say so, rather than render nothing.
  return (
    <p className="text-sm text-muted">
      Card entry is not available for this subscription. Please contact the merchant.
    </p>
  );
}
