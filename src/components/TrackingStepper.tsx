import type { ShipmentStatus } from '@/types';
import { STATUS_FLOW, STATUS_LABELS } from '@/types';
import { Check } from 'lucide-react';

interface TrackingStepperProps {
  currentStatus: ShipmentStatus;
}

export default function TrackingStepper({ currentStatus }: TrackingStepperProps) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="w-full max-w-md mx-auto py-4">
      <div className="flex flex-col space-y-0 relative">
        {/* Vertical connecting line background */}
        <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-slate-100 dark:bg-slate-800" />

        {/* Active progress line */}
        {currentIndex > 0 && (
          <div
            className="absolute left-[17px] top-4 w-[2px] bg-emerald-500 transition-all duration-700 ease-in-out"
            style={{
              height: `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`,
              maxHeight: 'calc(100% - 32px)'
            }}
          />
        )}

        {STATUS_FLOW.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLast = index === STATUS_FLOW.length - 1;

          return (
            <div key={status} className={`flex items-start gap-6 relative z-10 ${!isLast ? 'pb-10' : ''}`}>
              {/* Node */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : isActive
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 scale-110 shadow-xl shadow-emerald-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                )}
              </div>

              {/* Label & Details */}
              <div className="flex flex-col pt-1">
                <span
                  className={`text-sm font-black uppercase tracking-wider transition-colors duration-300 ${
                    isCompleted || isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold text-emerald-500 mt-0.5 animate-in fade-in slide-in-from-left-2 duration-500">
                    CURRENT STATE
                  </span>
                )}
                {(isCompleted || isActive) && (
                   <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                      Protocol verified and logged.
                   </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
