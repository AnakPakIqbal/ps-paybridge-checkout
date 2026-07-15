import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { icons } from '../atoms/icons';

interface PaymentFooterProps {
  label: string;
  onSubmit: () => void;
}

export default function PaymentFooter({ label, onSubmit }: Readonly<PaymentFooterProps>) {
  return (
    <div className="flex flex-col gap-4">
      <Button onClick={onSubmit}>
        <Icon path={icons.lock} size={14} />
        {label}
      </Button>
      <p className="text-center text-xs text-muted">
        By continuing, you agree to our <span className="text-brand">Terms of Service</span> and{' '}
        <span className="text-brand">Privacy Policy</span>.
      </p>
      <p className="text-center text-xs text-muted/70">
        PayBridge &middot; By{' '}
        <a
          href="https://point-star.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-lineSoft hover:text-text hover:decoration-current"
        >
          Point Star
        </a>
      </p>
    </div>
  );
}
