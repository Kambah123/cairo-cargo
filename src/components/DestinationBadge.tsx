import type { Destination } from '@/types';
import { DESTINATION_COLORS } from '@/types';

interface DestinationBadgeProps {
  destination: Destination;
  size?: 'sm' | 'md';
}

export default function DestinationBadge({ destination, size = 'md' }: DestinationBadgeProps) {
  const color = DESTINATION_COLORS[destination];
  const label = destination === 'kano' ? 'Kano' : 'Abuja';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: color + '15',
        color: color,
        borderColor: color + '40',
      }}
    >
      <span
        className={`rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
