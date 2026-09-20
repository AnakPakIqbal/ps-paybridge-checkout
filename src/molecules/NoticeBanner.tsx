import { AlertTriangle } from 'lucide-react';

const TONE_CLASSNAMES = {
  // Dark-on-light text: the pale -200 shades ErrorBanner uses were chosen for a dark
  // panel and are close to unreadable on this app's white card.
  error: {
    box: 'bg-red-500/10 border-red-500/30 text-red-800',
    icon: 'text-red-600',
    close: 'text-red-700 hover:text-red-900',
  },
  warning: {
    box: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-900',
    icon: 'text-yellow-600',
    close: 'text-yellow-800 hover:text-yellow-950',
  },
};

interface NoticeBannerProps {
  tone: keyof typeof TONE_CLASSNAMES;
  title: string;
  message: string;
  onClose?: () => void;
}

// ErrorBanner (StatusViews) is worded for payment failures; this is the same layout with
// the wording left to the caller, for pages that are not about a payment.
export default function NoticeBanner({
  tone,
  title,
  message,
  onClose,
}: Readonly<NoticeBannerProps>) {
  const classes = TONE_CLASSNAMES[tone];
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 border px-4 py-3 rounded-xl text-xs mb-4 ${classes.box}`}
    >
      <AlertTriangle className={`flex-shrink-0 mt-0.5 ${classes.icon}`} size={14} />
      <div className="flex-1">
        <p className="font-semibold mb-0.5">{title}</p>
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`text-xs font-semibold self-start ${classes.close}`}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
