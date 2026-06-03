import { useState } from 'react';
import { useData } from '@/context/DataContext';
import {
  UserPlus, Search,
  ToggleLeft, ToggleRight, XCircle, Shield, MapPin, Phone, Mail, User as UserIcon, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole, User } from '@/types';

export default function StaffManagement() {
  const { staff, addStaff, updateStaff } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
  };

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = generatePassword();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserRole;
    const branch = formData.get('branch') as any;

    try {
      const newStaff = {
        name,
        username: email,
        role,
        branch,
        isActive: true,
        phone: formData.get('phone') as string,
      };
      await addStaff(newStaff, password);
      setGeneratedPassword(password);
      toast.success('Staff account created successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create staff');
    }
  };

  const toggleStatus = async (s: User) => {
    const reason = window.prompt(`Reason for ${s.isActive ? 'deactivating' : 'activating'} ${s.name}:`);
    if (reason) {
        try {
            await updateStaff(s.id, { isActive: !s.isActive });
            toast.success('Staff status updated');
        } catch { toast.error('Failed to update status'); }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h1 className="text-4xl font-black tracking-tight text-[#1A202C] uppercase">Staff <span className="text-[#1B4332]">Directory</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Create users, manage permissions, and monitor access</p>
        </div>
        <button onClick={() => { setGeneratedPassword(null); setIsAddModalOpen(true); }} className="h-14 px-8 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#1B4332]/20 active:scale-95 transition-all flex items-center gap-3 text-xs hover:bg-[#2D6A4F]">
          <UserPlus className="w-5 h-5" /> Add New Staff
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, email, or role..." className="w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-[#1A202C] focus:border-[#1B4332] outline-none transition-all shadow-sm" />
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                        <th className="px-10 py-6">Employee</th>
                        <th className="px-10 py-6">Role & Branch</th>
                        <th className="px-10 py-6">Last Activity</th>
                        <th className="px-10 py-6 text-right">Access Control</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredStaff.map(s => (
                        <tr key={s.id} className={`hover:bg-slate-50/50 transition-all ${!s.isActive ? 'opacity-60 grayscale' : ''}`}>
                            <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${s.isActive ? 'bg-emerald-100 text-[#1B4332]' : 'bg-slate-100 text-slate-400'}`}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-[#1A202C] uppercase tracking-tighter">{s.name}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold"><Mail className="w-3 h-3" />{s.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-black text-[#1A202C] uppercase tracking-tighter capitalize"><Shield className="w-3 h-3 text-[#1B4332]" /> {s.role.replace('_', ' ')}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wide font-bold"><MapPin className="w-3 h-3" /> {s.branch}</div>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-[#1A202C]">{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : 'Never'}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{s.lastLoginIp || 'No IP logged'}</p>
                                </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                                <button onClick={() => toggleStatus(s)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${s.isActive ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                                    {s.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    {s.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredStaff.length === 0 && <div className="py-32 text-center text-slate-400 font-black uppercase tracking-widest">No staff accounts found</div>}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden border border-slate-100 shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                    <h2 className="font-black text-xl text-[#1A202C] uppercase tracking-tight">Create Staff Account</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Credentials will be generated</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><XCircle className="w-6 h-6 text-slate-300" /></button>
            </div>
             {generatedPassword ? (
               <div className="p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
                 <div className="p-6 bg-emerald-50 rounded-3xl inline-block"><Lock className="w-10 h-10 text-emerald-600" /></div>
                 <div className="space-y-2">
                    <p className="font-black text-[#1A202C] uppercase tracking-tight">Account Created Successfully!</p>
                    <p className="text-[10px] text-slate-500 font-bold">Copy this temporary password and share it securely. The employee will be forced to change it.</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl font-mono font-black text-2xl tracking-widest text-[#1B4332] border-2 border-dashed border-slate-200 select-all">
                    {generatedPassword}
                 </div>
                 <button onClick={() => setIsAddModalOpen(false)} className="w-full h-14 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#1B4332]/20 hover:bg-[#2D6A4F] transition-all">Done, I've Copied It</button>
               </div>
             ) : (
               <form onSubmit={handleAddStaff} className="p-8 space-y-5">
                 <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Full Name</label><div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input name="name" placeholder="John Doe" required className="w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl focus:border-[#1B4332] outline-none transition-colors" /></div></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input name="email" type="email" placeholder="john@cairocargo.com" required className="w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl focus:border-[#1B4332] outline-none transition-colors" /></div></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Phone Number</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input name="phone" placeholder="+20 123..." required className="w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl focus:border-[#1B4332] outline-none transition-colors" /></div></div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Role</label><select name="role" className="w-full h-12 border-2 border-slate-200 rounded-xl px-3 bg-white outline-none focus:border-[#1B4332] font-bold text-sm"><option value="cairo_staff">Cairo Staff</option><option value="kano_staff">Kano Staff</option><option value="abuja_staff">Abuja Staff</option><option value="admin">Administrator</option></select></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Branch</label><select name="branch" className="w-full h-12 border-2 border-slate-200 rounded-xl px-3 bg-white outline-none focus:border-[#1B4332] font-bold text-sm"><option value="cairo">Cairo (Base)</option><option value="kano">Kano Branch</option><option value="abuja">Abuja Branch</option></select></div>
                 </div>

                 <button type="submit" className="w-full h-14 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl mt-4 shadow-xl shadow-[#1B4332]/20 hover:bg-[#2D6A4F] transition-all transform active:scale-95">Create Staff Account</button>
               </form>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
