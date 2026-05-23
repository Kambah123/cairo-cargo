import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { Package, MapPin, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('cairo_staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Demo mode: accept any credentials
    setTimeout(() => {
      login(username || 'staff_user', selectedRole);
      setIsLoading(false);

      // Redirect based on role
      const redirectMap: Record<UserRole, string> = {
        cairo_staff: '/cairo',
        nigeria_staff: '/nigeria',
        admin: '/admin',
      };
      navigate(redirectMap[selectedRole]);
    }, 500);
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'cairo_staff', label: 'Cairo Staff' },
    { value: 'nigeria_staff', label: 'Nigeria Staff' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1B4332] relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
          }}
        />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-[28px] font-bold text-white mb-3 tracking-tight">
            CargoFlow Staff Portal
          </h2>
          <p className="text-white/70 text-[15px] max-w-sm leading-relaxed">
            Secure access for Cairo and Nigeria operations teams. Manage shipments, track cargo, and confirm deliveries.
          </p>

          {/* Map illustration */}
          <div className="mt-10">
            <img
              src="/map-route.jpg"
              alt="Cairo to Nigeria route"
              className="w-48 h-64 object-contain mx-auto rounded-lg opacity-80"
            />
            <div className="flex items-center justify-center gap-6 mt-4 text-white/60 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Cairo
              </span>
              <ArrowRight className="w-4 h-4" />
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Nigeria
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <img src="/logo-icon.png" alt="CargoFlow" className="w-8 h-8" />
            <span className="text-[#1B4332] font-bold text-xl">CargoFlow</span>
          </div>

          <h1 className="text-[28px] font-bold text-[#1A202C] mb-1 tracking-tight">Staff Login</h1>
          <p className="text-[#4A5568] text-[15px] mb-6">Select your role and sign in to continue</p>

          {/* Role Selector */}
          <div className="flex rounded-lg bg-[#EDF2F7] p-1 mb-6">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                  selectedRole === role.value
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-[#4A5568] hover:text-[#1A202C]'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#4A5568] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-[#A0AEC0]"
                  />
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#4A5568] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-10 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-[#A0AEC0]"
                  />
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#4A5568] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-[#E53E3E]">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#1B4332] text-white font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#3182CE] hover:text-[#2D6A4F] transition-colors">
              Back to Tracking Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
