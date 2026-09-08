import { Check, Copy, ExternalLink, QrCode, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import type { PaymentAttempt, PaymentMethodOption } from '../types/checkout';

import WalletOption from '../molecules/WalletOption';
import { PAYMENT_METHOD_CATEGORY, QR_PROTOCOL_PREFIX } from '../types/checkout';
import { formatCurrency } from '../utils/formatCurrency';

const COPY_FEEDBACK_MS = 2000;

// Xendit QR channels hand back a raw EMVCo payload as `xendit-qr://<CHANNEL>/<payload>`
// rather than an image URL, so the payload is extracted and rendered client-side.
function extractQrPayload(checkoutUrl: string): string | null {
  if (!checkoutUrl.startsWith(QR_PROTOCOL_PREFIX.XENDIT)) return null;
  const withoutScheme = checkoutUrl.slice(QR_PROTOCOL_PREFIX.XENDIT.length);
  const separatorIndex = withoutScheme.indexOf('/');
  if (separatorIndex === -1) return null;
  const payload = withoutScheme.slice(separatorIndex + 1);
  return payload.length > 0 ? payload : null;
}

interface QrisPanelProps {
  qrUrl: string | null;
  qrPayload: string | null;
  amountLabel: string | null;
  codeCopied: boolean;
  onCopyCode: () => void;
}

function QrisPanel({
  qrUrl,
  qrPayload,
  amountLabel,
  codeCopied,
  onCopyCode,
}: Readonly<QrisPanelProps>) {
  return (
    <div className="flex flex-col items-center max-w-sm">
      <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
        <QrCode size={24} />
      </div>
      <h2 className="text-base font-semibold text-text mb-1">Scan QR Code</h2>
      {amountLabel && (
        <span className="text-[11px] font-mono font-semibold text-brand bg-brandSoft px-2.5 py-1 rounded-full mb-3">
          {amountLabel}
        </span>
      )}
      <p className="text-xs text-muted mb-5">
        Scan the QR code below using GoPay, OVO, ShopeePay, or your banking app.
      </p>

      <div className="relative mb-3">
        <div
          className="qr-target-glow absolute -inset-3 rounded-[28px] bg-brand/15 blur-xl"
          aria-hidden="true"
        />
        <div className="bg-white p-5 rounded-xl2 shadow-xl border border-white/10 relative group overflow-hidden">
          {/* Reticle corners breathe gently to read as a "live" scan target */}
          <div className="qr-target-reticle absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand/40" />
          <div className="qr-target-reticle absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand/40" />
          <div className="qr-target-reticle absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand/40" />
          <div className="qr-target-reticle absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand/40" />
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Payment QR Code"
              className="w-48 h-48 sm:w-52 sm:h-52 relative z-10"
            />
          ) : (
            <QRCodeSVG
              value={qrPayload ?? ''}
              title="Payment QR Code"
              level="M"
              marginSize={0}
              className="w-48 h-48 sm:w-52 sm:h-52 relative z-10"
            />
          )}
        </div>
      </div>

      {qrPayload ? (
        <button
          type="button"
          onClick={onCopyCode}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-brand transition-colors duration-150 mb-5"
        >
          {codeCopied ? <Check size={12} /> : <Copy size={12} />}
          {codeCopied ? 'Code copied' : "Can't scan? Copy the QRIS code"}
        </button>
      ) : (
        <div className="mb-2" />
      )}

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
            Choose <span className="text-text font-medium">Scan QR / Pay</span> and upload/scan
            this QR code.
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="font-semibold text-brand min-w-[14px]">4.</span>
          <span>Verify merchant info and pay. The checkout page will auto-confirm.</span>
        </div>
      </div>
    </div>
  );
}

interface EwalletFormProps {
  availableMethods?: PaymentMethodOption[];
  selectedMethod?: string;
  setSelectedMethod?: (code: string) => void;
  paymentAttempt?: PaymentAttempt | null;
  amount?: number | undefined;
  currency?: string | undefined;
}

export default function EwalletForm({
  availableMethods = [],
  selectedMethod = '',
  setSelectedMethod,
  paymentAttempt = null,
  amount,
  currency,
}: Readonly<EwalletFormProps>) {
  const [codeCopied, setCodeCopied] = useState(false);

  if (paymentAttempt) {
    const checkoutUrl = paymentAttempt.checkoutUrl ?? '';
    const isMidtransQrEndpoint = /\/qr-code(?:$|[/?])/i.test(checkoutUrl);
    const isImageUrl = /\.(png|jpg|jpeg|gif)(?:$|\?)/i.test(checkoutUrl);
    const qrPayload = extractQrPayload(checkoutUrl);
    const isQris = isMidtransQrEndpoint || isImageUrl || qrPayload !== null;

    const qrUrl = isMidtransQrEndpoint || isImageUrl ? checkoutUrl : null;
    const amountLabel = amount === undefined ? null : formatCurrency(amount, currency);

    const handleCopyCode = () => {
      if (!qrPayload) return;
      void navigator.clipboard.writeText(qrPayload);
      setCodeCopied(true);
      setTimeout(() => {
        setCodeCopied(false);
      }, COPY_FEEDBACK_MS);
    };

    return (
      <div className="flex flex-col items-center justify-center p-2 text-center h-full">
        {isQris ? (
          <QrisPanel
            qrUrl={qrUrl}
            qrPayload={qrPayload}
            amountLabel={amountLabel}
            codeCopied={codeCopied}
            onCopyCode={handleCopyCode}
          />
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
