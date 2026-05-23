import type { ShipmentStatus } from '@/types';
import { STATUS_FLOW, STATUS_LABELS } from '@/types';
import { Check } from 'lucide-react';

interface TrackingStepperProps {
  currentStatus: ShipmentStatus;
}

export default function TrackingStepper({ currentStatus }: TrackingStepperProps) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between relative">
        {/* Connecting lines background */}
        <div className="absolute top-[17px] left-0 right-0 h-[2px] bg-[#E2E8F0]" />
        {/* Active progress line */}
        {currentIndex > 0 && (
          <div
            className="absolute top-[17px] left-0 h-[2px] bg-[#38A169] transition-all duration-500"
            style={{
              width: `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`,
            }}
          />
        )}

        {STATUS_FLOW.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center relative z-10 flex-1">
              {/* Node */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#38A169] border-[#38A169]'
                    : isActive
                    ? 'bg-[#38A169] border-[#38A169] stepper-active-ring relative'
                    : 'bg-white border-[#CBD5E0]'
                }`}
              >
                {isCompleted && <Check className="w-4 h-4 text-white" />}
                {isActive && <span className="w-2 h-2 bg-white rounded-full" />}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-center text-[11px] font-medium leading-tight max-w-[70px] ${
                  isCompleted || isActive ? 'text-[#1A202C]' : 'text-[#A0AEC0]'
                }`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
