import { useState } from 'react';
import { useData } from '@/context/DataContext';
import {
  UserPlus, Search,
  ToggleLeft, ToggleRight, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

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
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
  };

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = generatePassword();
    try {
      const newStaff = {
        name: formData.get('name') as string,
        username: formData.get('email') as string,
        role: formData.get('role') as UserRole,
        branch: formData.get('branch') as any,
        isActive: true,
      };
      await addStaff(newStaff, password);
      setGeneratedPassword(password);
      toast.success('Staff added');
    } catch { toast.error('Failed'); }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateStaff(id, { isActive: !currentStatus });
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Staff Management</h1><button onClick={() => { setGeneratedPassword(null); setIsAddModalOpen(true); }} className="h-10 px-4 bg-[#1B4332] text-white rounded-lg flex items-center gap-2"><UserPlus className="w-4 h-4" /> Add Staff</button></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full h-11 pl-10 pr-4 border rounded-lg" /></div>
      <div className="bg-white border rounded-xl overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th></tr></thead>
          <tbody className="divide-y">{filteredStaff.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4"><div><p className="font-bold">{s.name}</p><p className="text-xs text-gray-500">{s.username}</p></div></td>
                <td className="px-6 py-4 text-sm capitalize">{s.role.replace('_', ' ')}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(s.id, s.isActive)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}</tbody></table></div>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"><div className="bg-white rounded-2xl w-full max-w-md overflow-hidden"><div className="p-6 border-b flex justify-between items-center"><h2 className="font-bold">Add Staff</h2><button onClick={() => setIsAddModalOpen(false)}><XCircle className="w-5 h-5" /></button></div>
             {generatedPassword ? <div className="p-8 text-center space-y-6"><p>Created! Share password:</p><div className="bg-gray-100 p-4 rounded font-mono font-bold text-xl">{generatedPassword}</div><button onClick={() => setIsAddModalOpen(false)} className="w-full h-11 bg-gray-200 rounded-lg">Close</button></div> : (
               <form onSubmit={handleAddStaff} className="p-6 space-y-4"><input name="name" placeholder="Full Name" required className="w-full h-11 border rounded px-3" /><input name="email" type="email" placeholder="Email" required className="w-full h-11 border rounded px-3" /><select name="role" className="w-full h-11 border rounded px-3"><option value="cairo_staff">Cairo</option><option value="kano_staff">Kano</option><option value="abuja_staff">Abuja</option><option value="admin">Admin</option></select><select name="branch" className="w-full h-11 border rounded px-3"><option value="cairo">Cairo</option><option value="kano">Kano</option><option value="abuja">Abuja</option></select><button type="submit" className="w-full h-11 bg-[#1B4332] text-white font-bold rounded-lg">Create Account</button></form>
             )}</div></div>
      )}
    </div>
  );
}
