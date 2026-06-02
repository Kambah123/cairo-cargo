import type { PriorityLabel } from '@/types';
import { PRIORITY_CONFIG } from '@/types';

interface PriorityChipsProps {
  labels: PriorityLabel[];
  size?: 'sm' | 'md';
}

export default function PriorityChips({ labels, size = 'md' }: PriorityChipsProps) {
  if (!labels.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => {
        const config = PRIORITY_CONFIG[label];
        return (
          <span
            key={label}
            className={`inline-block font-bold rounded-md border shadow-sm ${
              size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[11px]'
            }`}
            style={{
              backgroundColor: config.bg,
              color: config.text,
              borderColor: `${config.text}20`,
            }}
          >
            {config.label.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
}
