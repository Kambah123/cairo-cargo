import type { ShipmentStatus } from '@/types';
import { STATUS_BADGE_COLORS, STATUS_LABELS } from '@/types';
import { Check } from 'lucide-react';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = STATUS_BADGE_COLORS[status];
  const label = STATUS_LABELS[status];
  const isDelivered = status === 'delivered';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.text + '30',
      }}
    >
      {isDelivered && <Check className="w-3 h-3" />}
      {label}
    </span>
  );
}
