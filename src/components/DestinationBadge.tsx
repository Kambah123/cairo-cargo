import type { Destination } from '@/types';
import { DESTINATION_COLORS } from '@/types';
import { MapPin } from 'lucide-react';

interface DestinationBadgeProps {
  destination: Destination;
  size?: 'sm' | 'md' | 'lg';
}

export default function DestinationBadge({ destination, size = 'md' }: DestinationBadgeProps) {
  const color = DESTINATION_COLORS[destination];
  const label = destination.charAt(0).toUpperCase() + destination.slice(1);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm font-bold gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border shadow-sm transition-all ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}10`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      <MapPin className={size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  );
}
