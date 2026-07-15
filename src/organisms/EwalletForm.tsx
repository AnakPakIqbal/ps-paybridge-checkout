import { ExternalLink, QrCode, Smartphone } from 'lucide-react';

import type { PaymentAttempt, PaymentMethodOption } from '../types/checkout';

import WalletOption from '../molecules/WalletOption';
import { PAYMENT_METHOD_CATEGORY } from '../types/checkout';

interface EwalletFormProps {
  availableMethods?: PaymentMethodOption[];
  selectedMethod?: string;
  setSelectedMethod?: (code: string) => void;
  paymentAttempt?: PaymentAttempt | null;
}

export default function EwalletForm({
  availableMethods = [],
  selectedMethod = '',
  setSelectedMethod,
  paymentAttempt = null,
}: Readonly<EwalletFormProps>) {
  if (paymentAttempt) {
    const methodLower = (paymentAttempt.paymentMethod ?? '').toLowerCase();
    const isQris =
      methodLower.includes('qris') || methodLower.includes('qr_code') || methodLower.includes('qr');

    // Determine if we should generate a QR code image
    let qrUrl: string | null = null;
    if (isQris && paymentAttempt.checkoutUrl) {
      qrUrl = /\.(png|jpg|jpeg|gif)/i.test(paymentAttempt.checkoutUrl)
        ? paymentAttempt.checkoutUrl
        : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentAttempt.checkoutUrl)}`;
    }

    return (
      <div className="flex flex-col items-center justify-center p-2 text-center h-full">
        {qrUrl ? (
          <div className="flex flex-col items-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
              <QrCode size={24} />
            </div>
            <h2 className="text-base font-semibold text-text mb-1">Scan QRIS Code</h2>
            <p className="text-xs text-muted mb-5">
              Scan the QR code below using GoPay, OVO, ShopeePay, or your banking app.
            </p>

            <div className="bg-white p-4.5 rounded-xl2 shadow-xl border border-white/10 mb-5 relative group overflow-hidden">
              {/* Subtle tech border overlay */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand/40" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand/40" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand/40" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand/40" />
              <img
                src={qrUrl}
                alt="QRIS QR Code"
                className="w-48 h-48 sm:w-52 sm:h-52 relative z-10"
              />
            </div>

            <div className="text-left w-full text-xs text-muted leading-relaxed space-y-3.5 bg-panel px-4 py-4 rounded-xl border border-lineSoft">
              <p className="font-semibold text-text text-center border-b border-lineSoft pb-1.5 mb-2.5">
                How to Pay
              </p>
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-brand min-w-[14px]">1.</span>
                <span>Take a screenshot or save the QR code if on mobile.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-brand min-w-[14px]">2.</span>
                <span>Open GoPay, ShopeePay, OVO, LinkAja, or your Bank App.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-brand min-w-[14px]">3.</span>
                <span>
                  Choose <span className="text-text font-medium">Scan QR / Pay</span> and
                  upload/scan this QR code.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-brand min-w-[14px]">4.</span>
                <span>Verify merchant info and pay. The checkout page will auto-confirm.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
              <Smartphone size={24} />
            </div>
            <h2 className="text-base font-semibold text-text mb-2">
              Pay with {paymentAttempt.paymentMethod}
            </h2>
            <p className="text-xs text-muted mb-6">
              Confirm your transaction in the external application. You will be redirected shortly
              or click the button below.
            </p>
            {paymentAttempt.checkoutUrl && (
              <a
                href={paymentAttempt.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 px-5 rounded-xl hover:bg-brand/90 transition-all duration-150 shadow-lg shadow-brand/10"
              >
                Open E-Wallet App
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  const walletMethods = availableMethods.filter(
    (option) =>
      option.category === PAYMENT_METHOD_CATEGORY.E_WALLET ||
      option.category === PAYMENT_METHOD_CATEGORY.QR_CODE,
  );

  return (
    <div>
      <h2 className="text-sm font-semibold text-text mb-4">Select e-wallet or QRIS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {walletMethods.map((method) => (
          <WalletOption
            key={method.code}
            label={method.name}
            active={selectedMethod === method.code}
            onClick={() => {
              setSelectedMethod?.(method.code);
            }}
          />
        ))}
      </div>
    </div>
  );
}
