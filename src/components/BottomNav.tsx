import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Search,
  Settings,
  PlusCircle,
  Truck
} from 'lucide-react';
import type { UserRole } from '@/types';

export default function BottomNav() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) return null;

  const roleNavItems: Record<UserRole, { label: string; icon: any; href: string }[]> = {
    cairo_staff: [
      { label: 'DASH', icon: LayoutDashboard, href: '/cairo' },
      { label: 'PARCELS', icon: Package, href: '/cairo/shipments' },
      { label: 'NEW', icon: PlusCircle, href: '/cairo/new' },
      { label: 'SACKS', icon: Layers, href: '/cairo/sacks' },
      { label: 'INTEL', icon: Search, href: '/cairo/search' },
    ],
    kano_staff: [
      { label: 'DASH', icon: LayoutDashboard, href: '/nigeria' },
      { label: 'ARRIVE', icon: Truck, href: '/nigeria/arrivals' },
      { label: 'PICKUP', icon: Package, href: '/nigeria/deliveries' },
      { label: 'INTEL', icon: Search, href: '/nigeria/search' },
      { label: 'SACKS', icon: Layers, href: '/nigeria/sacks' },
    ],
    abuja_staff: [
      { label: 'DASH', icon: LayoutDashboard, href: '/nigeria' },
      { label: 'ARRIVE', icon: Truck, href: '/nigeria/arrivals' },
      { label: 'PICKUP', icon: Package, href: '/nigeria/deliveries' },
      { label: 'INTEL', icon: Search, href: '/nigeria/search' },
      { label: 'SACKS', icon: Layers, href: '/nigeria/sacks' },
    ],
    admin: [
      { label: 'DASH', icon: LayoutDashboard, href: '/admin' },
      { label: 'PARCELS', icon: Package, href: '/admin/shipments' },
      { label: 'SACKS', icon: Layers, href: '/admin/sacks' },
      { label: 'INTEL', icon: Search, href: '/admin/search' },
      { label: 'STAFF', icon: Settings, href: '/admin/staff' },
    ],
  };

  const items = roleNavItems[user.role] || [];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] px-6 z-50 flex items-center justify-between shadow-2xl overflow-hidden">
      {items.map((item) => {
        const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-500 relative ${
              isActive
                ? 'text-[#1B4332] scale-110'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isActive && (
               <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1B4332] rounded-full shadow-[0_0_8px_rgba(27,67,50,0.8)]" />
            )}
            <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#1B4332]' : 'stroke-[1.5px]'}`} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
