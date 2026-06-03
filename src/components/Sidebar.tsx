import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Layers,
  Search,
  Users,
  AlertTriangle,
  History,
  PlusCircle,
  LogOut,
  TrendingUp
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  if (!user) return null;

  const items = [
    { label: 'Intelligence Hub', icon: TrendingUp, path: '/admin' },
    { label: 'Register Parcel', icon: PlusCircle, path: '/admin/new-shipment' },
    { label: 'Operational Ledger', icon: Package, path: '/admin/shipments' },
    { label: 'Consolidation Console', icon: Layers, path: '/admin/sacks' },
    { label: 'Master Intel', icon: Search, path: '/admin/search' },
    { label: 'Security Alerts', icon: AlertTriangle, path: '/admin/alerts' },
    { label: 'Immutable Audit', icon: History, path: '/admin/audit' },
    { label: 'Staff Management', icon: Users, path: '/admin/staff' },
  ];

  return (
    <aside className="hidden md:flex w-[300px] flex-col bg-white border-r border-slate-100 h-[calc(100vh-64px)] sticky top-16 shadow-sm">
      <nav className="flex-1 p-6 space-y-2">
        {items.map((item) => (
           <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-[#1B4332] text-white shadow-2xl shadow-[#1B4332]/30'
                : 'text-slate-500 hover:text-[#1B4332] hover:bg-slate-50'
            }`}
           >
             <item.icon className="w-5 h-5" />
             {item.label}
           </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-100">
        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="w-5 h-5" /> Secure Exit
        </button>
      </div>
    </aside>
  );
}
