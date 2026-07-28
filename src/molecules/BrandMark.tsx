import paybridgeLogo from '../assets/images/paybridge-logo.png';
import Badge from '../atoms/Badge';

export default function BrandMark() {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-lineSoft">
      <img src={paybridgeLogo} alt="PayBridge" className="h-8 w-auto bg-white rounded-md p-1" />
      <Badge>Secure Checkout</Badge>
    </div>
  );
}
