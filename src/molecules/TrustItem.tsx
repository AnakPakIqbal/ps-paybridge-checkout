import Icon from '../atoms/Icon';

interface TrustItemProps {
  icon: string;
  title: string;
  subtitle: string;
}

export default function TrustItem({ icon, title, subtitle }: Readonly<TrustItemProps>) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <div className="w-7 h-7 rounded-lg bg-brandDim border border-brand/20 flex items-center justify-center text-brand flex-shrink-0">
        <Icon path={icon} size={12} />
      </div>
      <div>
        <p className="text-xs text-text font-medium">{title}</p>
        <p className="text-[10px] text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
