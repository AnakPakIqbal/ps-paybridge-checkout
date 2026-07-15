import Icon from '../atoms/Icon';
import { icons } from '../atoms/icons';

interface SecureNoticeProps {
  title: string;
  subtitle: string;
}

export default function SecureNotice({ title, subtitle }: Readonly<SecureNoticeProps>) {
  return (
    <div className="flex items-center gap-3 rounded-xl2 border border-lineSoft bg-panel2/50 px-5 py-4">
      <div className="w-9 h-9 rounded-lg bg-panel flex items-center justify-center text-muted flex-shrink-0">
        <Icon path={icons.lock} size={16} />
      </div>
      <div>
        <p className="text-sm text-text font-medium">{title}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
