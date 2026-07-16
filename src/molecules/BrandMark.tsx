import paybridgeLogo from '../assets/images/paybridge-logo.png';
import Badge from '../atoms/Badge';

export default function BrandMark() {
  return (
    <div className="flex flex-col gap-3 pb-6 border-b border-lineSoft">
      <div className="flex items-center gap-3">
        <img src={paybridgeLogo} alt="PayBridge" className="h-10 w-auto bg-white rounded-md p-1" />
        <Badge>Secure Checkout</Badge>
      </div>
      <p className="text-sm text-muted">Your payment is protected</p>
    </div>
  );
}
