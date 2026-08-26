import paymentSecurityIllustration from '../assets/images/payment-security-illustration.png';

export default function PaymentMethodIntro() {
  return (
    <div className="flex flex-col items-center text-center gap-1 mb-6">
      <img
        src={paymentSecurityIllustration}
        alt=""
        className="w-40 sm:w-48 h-auto mb-2 select-none pointer-events-none"
        draggable={false}
      />
      <h1 className="text-lg font-semibold text-text">Choose payment method</h1>
      <p className="text-sm text-muted">Select a secure payment method to continue</p>
    </div>
  );
}
