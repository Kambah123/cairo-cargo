import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Package, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import type { UserRole } from '@/types';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isPublicPage = location.pathname === '/';

  const publicLinks = [
    { label: 'Track Shipment', href: '/' },
    { label: 'Staff Login', href: '/login' },
  ];

  const roleLinks: Record<UserRole, { label: string; href: string }[]> = {
    cairo_staff: [
      { label: 'Create Shipment', href: '/cairo' },
      { label: 'My Shipments', href: '/cairo/shipments' },
      { label: 'Batch Manager', href: '/cairo/batches' },
    ],
    kano_staff: [
      { label: 'Arrivals', href: '/nigeria' },
      { label: 'Deliveries', href: '/nigeria/deliveries' },
      { label: 'Pickup Log', href: '/nigeria/pickups' },
    ],
    abuja_staff: [
      { label: 'Arrivals', href: '/nigeria' },
      { label: 'Deliveries', href: '/nigeria/deliveries' },
      { label: 'Pickup Log', href: '/nigeria/pickups' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'All Shipments', href: '/admin/shipments' },
      { label: 'Analytics', href: '/admin/analytics' },
      { label: 'Staff Management', href: '/admin/staff' },
    ],
  };

  const links = isPublicPage && !isAuthenticated ? publicLinks : (user ? roleLinks[user.role] || [] : []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E2E8F0] h-14">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo-icon.png" alt="CargoFlow" className="w-7 h-7" />
          <span className="text-[#1B4332] font-bold text-lg tracking-tight">CargoFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === link.href
                  ? 'text-[#1B4332] bg-[#EDF2F7]'
                  : 'text-[#4A5568] hover:text-[#1B4332] hover:bg-[#EDF2F7]/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#EDF2F7] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#1A202C]">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-[#A0AEC0]" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50">
                    <div className="px-3 py-2 border-b border-[#E2E8F0]">
                      <p className="text-sm font-medium text-[#1A202C]">{user.name}</p>
                      <p className="text-xs text-[#A0AEC0] capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#E53E3E] hover:bg-[#FED7D7]/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-sm font-medium rounded-md hover:bg-[#2D6A4F] transition-colors"
            >
              <Package className="w-4 h-4" />
              Staff Login
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md hover:bg-[#EDF2F7] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5 text-[#1A202C]" /> : <Menu className="w-5 h-5 text-[#1A202C]" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <span className="font-bold text-[#1B4332]">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-[#EDF2F7]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === link.href
                      ? 'text-[#1B4332] bg-[#EDF2F7]'
                      : 'text-[#4A5568] hover:text-[#1B4332] hover:bg-[#EDF2F7]/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#E53E3E] hover:bg-[#FED7D7]/30 rounded-md mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
