import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }
    if (password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          await supabase.from('profiles').update({
              password_changed_at: new Date().toISOString()
          }).eq('id', user.id);
      }

      toast.success('Password updated successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border shadow-xl p-10 space-y-8">
        <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-4">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Security Update</h1>
            <p className="text-sm text-gray-400">You are required to change your password to continue</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required className="w-full h-12 pl-11 pr-4 border-2 rounded-xl focus:border-[#1B4332] outline-none transition-colors" />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Confirm New Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-type password" required className="w-full h-12 pl-11 pr-4 border-2 rounded-xl focus:border-[#1B4332] outline-none transition-colors" />
                </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full h-14 bg-[#1B4332] text-white font-bold rounded-2xl shadow-lg hover:bg-[#1B4332]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Update Password <ArrowRight className="w-4 h-4" /></>}
            </button>
        </form>
      </div>
    </div>
  );
}
