import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { Package, MapPin, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email) {
        setError('Please enter your email');
        setIsLoading(false);
        return;
      }
      if (!password) {
        setError('Please enter your password');
        setIsLoading(false);
        return;
      }

      await login(email, password, rememberMe);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { user } = useAuth();
  if (user) {
    const redirectMap: Record<UserRole, string> = {
      cairo_staff: '/cairo',
      kano_staff: '/nigeria',
      abuja_staff: '/nigeria',
      admin: '/admin',
    };
    navigate(redirectMap[user.role] || '/');
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-[#1B4332] relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)` }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"><Package className="w-10 h-10 text-white" /></div>
          <h2 className="text-[28px] font-bold text-white mb-3 tracking-tight">CargoFlow Staff Portal</h2>
          <p className="text-white/70 text-[15px] max-w-sm leading-relaxed">Secure access for Cairo and Nigeria operations teams. Manage shipments, track cargo, and confirm deliveries.</p>
          <div className="mt-10">
            <img src="/map-route.jpg" alt="Cairo to Nigeria route" className="w-48 h-64 object-contain mx-auto rounded-lg opacity-80" />
            <div className="flex items-center justify-center gap-6 mt-4 text-white/60 text-sm"><span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Cairo</span><ArrowRight className="w-4 h-4" /><span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Nigeria</span></div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center"><span className="text-[#1B4332] font-bold text-xl">CargoFlow</span></div>
          <h1 className="text-[28px] font-bold text-[#1A202C] mb-1 tracking-tight">Staff Login</h1>
          <p className="text-[#4A5568] text-[15px] mb-8">Sign in with your work email and password</p>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#4A5568] mb-1.5">Work Email</label>
                <div className="relative">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@cairo-cargo.local" className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all" />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-[#4A5568] mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 pl-10 pr-10 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all" />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-gray-300 text-[#1B4332] focus:ring-[#1B4332]" />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember Me</label>
              </div>
              {error && <p className="text-sm text-[#E53E3E] font-medium p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>}
              <button type="submit" disabled={isLoading} className="w-full h-11 bg-[#1B4332] text-white font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Login <ArrowRight className="w-4 h-4" /></>}</button>
            </div>
          </form>
          <div className="mt-6 text-center"><a href="/" className="text-sm text-[#3182CE] hover:text-[#2D6A4F] transition-colors">Back to Tracking Portal</a></div>
        </div>
      </div>
    </div>
  );
}
