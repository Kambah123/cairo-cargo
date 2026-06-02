import type { ShipmentStatus } from '@/types';
import { STATUS_BADGE_COLORS, STATUS_LABELS } from '@/types';
import { Check, Clock, AlertCircle, Package } from 'lucide-react';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = STATUS_BADGE_COLORS[status];
  const label = STATUS_LABELS[status];

  const getIcon = () => {
    switch (status) {
      case 'delivered': return <Check className="w-3 h-3" />;
      case 'on_hold': return <AlertCircle className="w-3 h-3" />;
      case 'awaiting_flight': return <Clock className="w-3 h-3" />;
      default: return <Package className="w-3 h-3" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full transition-all border ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: `${colors.text}20`,
      }}
    >
      {getIcon()}
      {label}
    </span>
  );
}
