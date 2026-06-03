import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Package, Menu, X, LogOut, User, ChevronDown, Search } from 'lucide-react';
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
      { label: 'Dashboard', href: '/cairo' },
      { label: 'Create', href: '/cairo' },
      { label: 'Sacks', href: '/cairo/batches' },
    ],
    kano_staff: [
      { label: 'Arrivals', href: '/nigeria' },
      { label: 'Deliveries', href: '/nigeria/deliveries' },
    ],
    abuja_staff: [
      { label: 'Arrivals', href: '/nigeria' },
      { label: 'Deliveries', href: '/nigeria/deliveries' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Shipments', href: '/admin/shipments' },
      { label: 'Sacks', href: '/admin/sacks' },
      { label: 'Audit', href: '/admin/audit' },
    ],
  };

  const getSearchPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/search';
    if (user.role === 'cairo_staff') return '/cairo/search';
    return '/nigeria/search';
  };

  const links = isPublicPage && !isAuthenticated ? publicLinks : (user ? roleLinks[user.role] || [] : []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-16 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 bg-[#1B4332] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1B4332]/20 group-hover:scale-110 transition-transform">
             <Package className="w-6 h-6 text-white" />
          </div>
          <span className="text-[#1B4332] font-black text-xl tracking-tighter uppercase">Cargo<span className="text-emerald-600">Flow</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                location.pathname === link.href
                  ? 'text-[#1B4332] bg-[#EDF2F7]'
                  : 'text-slate-500 hover:text-[#1B4332] hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              to={getSearchPath()}
              className="p-3 text-slate-400 hover:text-[#1B4332] hover:bg-slate-50 rounded-2xl transition-all"
            >
              <Search className="w-5 h-5" />
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1B4332] flex items-center justify-center shadow-lg shadow-[#1B4332]/20">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-[#1A202C] tracking-tight leading-none uppercase">{user.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{user.role.replace('_', ' ')}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <p className="text-xs font-black text-[#1A202C] uppercase tracking-widest">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{user.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest"
                    >
                      <LogOut className="w-4 h-4" />
                      Secure Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-3 bg-[#1B4332] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#2D6A4F] shadow-xl shadow-[#1B4332]/20 transition-all active:scale-95"
            >
              Access Portal
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#1B4332] transition-all"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-4 top-20 bottom-4 w-72 bg-white z-50 shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <span className="font-black text-[#1B4332] uppercase tracking-widest text-xs">System Control</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-5 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${
                    location.pathname === link.href
                      ? 'text-white bg-[#1B4332] shadow-lg shadow-[#1B4332]/20'
                      : 'text-slate-400 hover:text-[#1B4332] hover:bg-slate-50'
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
                  className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black text-red-500 hover:bg-red-50 rounded-2xl mt-4 uppercase tracking-[0.2em]"
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
