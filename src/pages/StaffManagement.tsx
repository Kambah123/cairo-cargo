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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">Staff Directory</h1>
            <p className="text-sm text-gray-500">Manage access and permissions</p>
        </div>
        <button onClick={() => { setGeneratedPassword(null); setIsAddModalOpen(true); }} className="h-11 px-6 bg-[#1B4332] text-white rounded-2xl flex items-center gap-2 shadow-lg hover:bg-[#1B4332]/90 transition-all">
          <UserPlus className="w-4 h-4" /> Add New Staff
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, email, or role..." className="w-full h-14 pl-12 pr-4 border-2 rounded-2xl bg-white shadow-sm focus:border-[#1B4332] outline-none transition-colors" />
      </div>

      <div className="bg-white border-2 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        <th className="px-8 py-5">Employee</th>
                        <th className="px-8 py-5">Role & Branch</th>
                        <th className="px-8 py-5">Last Activity</th>
                        <th className="px-8 py-5 text-right">Access Control</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filteredStaff.map(s => (
                        <tr key={s.id} className={`hover:bg-gray-50/50 transition-colors ${!s.isActive ? 'opacity-60 grayscale' : ''}`}>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${s.isActive ? 'bg-green-100 text-[#1B4332]' : 'bg-gray-100 text-gray-400'}`}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{s.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-400"><Mail className="w-3 h-3" />{s.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 capitalize"><Shield className="w-3 h-3 text-blue-500" /> {s.role.replace('_', ' ')}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wide font-bold"><MapPin className="w-3 h-3" /> {s.branch}</div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-600">{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : 'Never'}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{s.lastLoginIp || 'No IP logged'}</p>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button onClick={() => toggleStatus(s)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${s.isActive ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>
                                    {s.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    {s.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredStaff.length === 0 && <div className="py-20 text-center text-gray-400">No staff accounts found</div>}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden border shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-xl">Create Staff Account</h2>
                    <p className="text-xs text-gray-400">Credentials will be generated</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><XCircle className="w-6 h-6 text-gray-300" /></button>
            </div>
             {generatedPassword ? (
               <div className="p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
                 <div className="p-6 bg-green-50 rounded-3xl inline-block"><Lock className="w-10 h-10 text-green-600" /></div>
                 <div className="space-y-2">
                    <p className="font-bold text-gray-900">Account Created Successfully!</p>
                    <p className="text-xs text-gray-400">Copy this temporary password and share it securely. The employee will be forced to change it.</p>
                 </div>
                 <div className="bg-gray-100 p-6 rounded-2xl font-mono font-bold text-2xl tracking-widest text-[#1B4332] border-2 border-dashed border-gray-200 select-all">
                    {generatedPassword}
                 </div>
                 <button onClick={() => setIsAddModalOpen(false)} className="w-full h-14 bg-[#1B4332] text-white font-bold rounded-2xl shadow-lg">Done, I've Copied It</button>
               </div>
             ) : (
               <form onSubmit={handleAddStaff} className="p-8 space-y-5">
                 <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Full Name</label><div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input name="name" placeholder="John Doe" required className="w-full h-12 pl-11 pr-4 border-2 rounded-xl focus:border-[#1B4332] outline-none transition-colors" /></div></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input name="email" type="email" placeholder="john@cairocargo.com" required className="w-full h-12 pl-11 pr-4 border-2 rounded-xl focus:border-[#1B4332] outline-none transition-colors" /></div></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Phone Number</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input name="phone" placeholder="+20 123..." required className="w-full h-12 pl-11 pr-4 border-2 rounded-xl focus:border-[#1B4332] outline-none transition-colors" /></div></div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Role</label><select name="role" className="w-full h-12 border-2 rounded-xl px-3 bg-white outline-none focus:border-[#1B4332]"><option value="cairo_staff">Cairo Staff</option><option value="kano_staff">Kano Staff</option><option value="abuja_staff">Abuja Staff</option><option value="admin">Administrator</option></select></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Branch</label><select name="branch" className="w-full h-12 border-2 rounded-xl px-3 bg-white outline-none focus:border-[#1B4332]"><option value="cairo">Cairo (Base)</option><option value="kano">Kano Branch</option><option value="abuja">Abuja Branch</option></select></div>
                 </div>

                 <button type="submit" className="w-full h-14 bg-[#1B4332] text-white font-bold rounded-2xl mt-4 shadow-xl hover:bg-[#1B4332]/90 transition-all transform active:scale-95">Create Staff Account</button>
               </form>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
