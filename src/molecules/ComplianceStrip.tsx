import Icon from '../atoms/Icon';
import { icons } from '../atoms/icons';

const items = [
  { icon: icons.shield, label: 'PCI DSS' },
  { icon: icons.lock, label: 'ISO 27001' },
  { icon: icons.shieldCheck, label: '3-D Secure' },
];

export default function ComplianceStrip() {
  return (
    <div className="flex items-center gap-4 pt-6 border-t border-lineSoft text-muted/70">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          <Icon path={item.icon} size={12} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
