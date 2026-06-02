import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Search,
  Settings,
  PlusCircle
} from 'lucide-react';
import type { UserRole } from '@/types';

export default function BottomNav() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) return null;

  const roleNavItems: Record<UserRole, { label: string; icon: any; href: string }[]> = {
    cairo_staff: [
      { label: 'Dash', icon: LayoutDashboard, href: '/cairo' },
      { label: 'Ship', icon: Package, href: '/cairo/shipments' },
      { label: 'New', icon: PlusCircle, href: '/cairo/new' },
      { label: 'Sacks', icon: Layers, href: '/cairo/sacks' },
      { label: 'Search', icon: Search, href: '/cairo/search' },
    ],
    kano_staff: [
      { label: 'Dash', icon: LayoutDashboard, href: '/nigeria' },
      { label: 'Arrive', icon: Package, href: '/nigeria/arrivals' },
      { label: 'Sacks', icon: Layers, href: '/nigeria/sacks' },
      { label: 'Search', icon: Search, href: '/nigeria/search' },
      { label: 'Set', icon: Settings, href: '/nigeria/settings' },
    ],
    abuja_staff: [
      { label: 'Dash', icon: LayoutDashboard, href: '/nigeria' },
      { label: 'Arrive', icon: Package, href: '/nigeria/arrivals' },
      { label: 'Sacks', icon: Layers, href: '/nigeria/sacks' },
      { label: 'Search', icon: Search, href: '/nigeria/search' },
      { label: 'Set', icon: Settings, href: '/nigeria/settings' },
    ],
    admin: [
      { label: 'Dash', icon: LayoutDashboard, href: '/admin' },
      { label: 'Ship', icon: Package, href: '/admin/shipments' },
      { label: 'Sacks', icon: Layers, href: '/admin/sacks' },
      { label: 'Search', icon: Search, href: '/admin/search' },
      { label: 'Set', icon: Settings, href: '/admin/staff' },
    ],
  };

  const items = roleNavItems[user.role] || [];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] px-2 py-1.5 z-50 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
      {items.map((item) => {
        const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-300 min-w-[64px] ${
              isActive
                ? 'text-[#1B4332] bg-[#EDF2F7] scale-105 font-bold'
                : 'text-[#A0AEC0] hover:text-[#4A5568]'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
