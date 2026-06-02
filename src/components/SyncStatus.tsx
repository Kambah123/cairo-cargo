import { useData } from '@/context/DataContext';
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react';

export default function SyncStatus() {
  const { isOnline } = useData();
  const queueCount = JSON.parse(localStorage.getItem('offline_queue') || '[]').length;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
      isOnline
        ? 'bg-green-50 text-green-600 border-green-100'
        : 'bg-red-50 text-red-600 border-red-100 animate-pulse'
    }`}>
      {queueCount > 0 ? (
        <RefreshCcw className="w-3 h-3 animate-spin" />
      ) : isOnline ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span>{queueCount > 0 ? `Syncing ${queueCount}...` : isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}
