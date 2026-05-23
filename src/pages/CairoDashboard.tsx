import { useState, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import BatchManager from '@/pages/BatchManager';
import ShipmentTag from '@/components/ShipmentTag';
import { Plus, List, Layers, LogOut, Camera, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment, Destination, PriorityLabel } from '@/types';
import { supabase } from '@/lib/supabase';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [{ label: 'Create Shipment', icon: Plus, path: '/cairo' }, { label: 'My Shipments', icon: List, path: '/cairo/shipments' }, { label: 'Batch Manager', icon: Layers, path: '/cairo/batches' }];
  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-white border-r h-[calc(100vh-56px)] sticky top-14">
      <nav className="flex-1 p-3 space-y-1">{items.map((item) => (
        <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${location.pathname === item.path ? 'bg-[#EDF2F7] text-[#1B4332] border-l-[3px] border-[#1B4332]' : 'text-[#4A5568]'}`}><item.icon className="w-4 h-4" />{item.label}</button>
      ))}</nav>
      <div className="p-3 border-t"><button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E53E3E]"><LogOut className="w-4 h-4" /> Logout</button></div>
    </aside>
  );
}

function CreateShipment() {
  const { addShipment } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);
  const [formData, setFormData] = useState({ senderName: '', senderPhone: '', receiverName: '', receiverPhone: '', destination: 'kano' as Destination, itemDescription: '', weight: '', totalAmount: '', paidAmount: '', batchId: '' });
  const [priorityLabels] = useState<PriorityLabel[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); const reader = new FileReader(); reader.onloadend = () => setPhotoPreview(reader.result as string); reader.readAsDataURL(file); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) { toast.error('Photo mandatory'); return; }
    setIsSubmitting(true);
    try {
      const trackingNumber = `${formData.destination === 'kano' ? 'KAN' : 'ABU'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;
      let photoUrl = '';
      if (photoFile) {
        const fileName = `${trackingNumber}.${photoFile.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('cargo-photos').upload(`shipments/${fileName}`, photoFile);
        if (!error) photoUrl = supabase.storage.from('cargo-photos').getPublicUrl(`shipments/${fileName}`).data.publicUrl;
      }
      const totalAmt = parseFloat(formData.totalAmount) || 0;
      const paidAmt = parseFloat(formData.paidAmount) || 0;
      const shipment: Shipment = { id: trackingNumber, trackingNumber, senderName: formData.senderName, senderPhone: formData.senderPhone, receiverName: formData.receiverName, receiverPhone: formData.receiverPhone, destination: formData.destination, itemDescription: formData.itemDescription, weight: parseFloat(formData.weight), weightUnit: 'kg', photoUrl: photoUrl || undefined, priorityLabels: [...priorityLabels, paidAmt >= totalAmt ? 'paid' : 'balance_due'], totalAmount: totalAmt, paidAmount: paidAmt, balanceDue: totalAmt - paidAmt, status: 'received', createdBy: user?.id || 'unknown', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await addShipment(shipment);
      setCreatedShipment(shipment);
      toast.success('Created');
    } catch { toast.error('Failed'); } finally { setIsSubmitting(false); }
  };
  return (
    <div className="max-w-4xl mx-auto pb-20"><h1 className="text-2xl font-bold mb-6">Create Shipment</h1>
      {!createdShipment ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border grid grid-cols-2 gap-4">
                <input placeholder="Sender Name" value={formData.senderName} onChange={e => updateField('senderName', e.target.value)} className="h-10 border rounded px-3" required />
                <input placeholder="Sender Phone" value={formData.senderPhone} onChange={e => updateField('senderPhone', e.target.value)} className="h-10 border rounded px-3" required />
                <input placeholder="Receiver Name" value={formData.receiverName} onChange={e => updateField('receiverName', e.target.value)} className="h-10 border rounded px-3" required />
                <input placeholder="Receiver Phone" value={formData.receiverPhone} onChange={e => updateField('receiverPhone', e.target.value)} className="h-10 border rounded px-3" required />
              </div>
              <div className="bg-white p-6 rounded-2xl border grid grid-cols-2 gap-4">
                <select value={formData.destination} onChange={e => updateField('destination', e.target.value as Destination)} className="h-10 border rounded px-3"><option value="kano">Kano</option><option value="abuja">Abuja</option></select>
                <input type="number" placeholder="Weight" value={formData.weight} onChange={e => updateField('weight', e.target.value)} className="h-10 border rounded px-3" required />
              </div>
              <div className="bg-white p-6 rounded-2xl border grid grid-cols-2 gap-4">
                <input type="number" placeholder="Total" value={formData.totalAmount} onChange={e => updateField('totalAmount', e.target.value)} className="h-10 border rounded px-3" required />
                <input type="number" placeholder="Paid" value={formData.paidAmount} onChange={e => updateField('paidAmount', e.target.value)} className="h-10 border rounded px-3" required />
              </div>
            </div>
            <div className="space-y-6"><div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50">{photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-gray-300" />}</div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" /><button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[#1B4332] text-white font-bold rounded-xl">{isSubmitting ? 'Registering...' : 'Register Shipment'}</button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white p-8 rounded-3xl border shadow-xl text-center space-y-6"><h2 className="text-2xl font-bold">Shipment Registered!</h2><p className="text-3xl font-mono font-bold">{createdShipment.trackingNumber}</p>
           <div className="flex justify-center"><ShipmentTag shipment={createdShipment} /></div>
           <div className="flex gap-4"><button onClick={() => setCreatedShipment(null)} className="flex-1 h-12 border rounded-xl">Create Another</button><button onClick={() => navigate('/cairo/shipments')} className="flex-1 h-12 bg-[#1B4332] text-white rounded-xl">View My Shipments</button></div>
        </div>
      )}
    </div>
  );
}

function MyShipments() {
  const { shipments } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const myShipments = shipments.filter(s => s.createdBy === user?.id && s.trackingNumber.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto"><h1 className="text-2xl font-bold mb-6">My Shipments</h1><input placeholder="Search..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full h-12 border rounded-xl px-4 mb-4" />
      <div className="bg-white border rounded-xl overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3">Tracking ID</th><th className="px-4 py-3">Sender</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
          <tbody className="divide-y">{myShipments.map(s => (
            <tr key={s.id}><td className="px-4 py-3 font-mono font-bold">{s.trackingNumber}</td><td className="px-4 py-3 text-sm">{s.senderName}</td><td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td><td className="px-4 py-3 text-right"><button onClick={() => window.print()} className="p-2"><Printer className="w-4 h-4" /></button></td></tr>
          ))}</tbody></table></div>
    </div>
  );
}

export default function CairoDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><div className="flex pt-14"><Sidebar /><main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]"><Routes><Route path="/" element={<CreateShipment />} /><Route path="/shipments" element={<MyShipments />} /><Route path="/batches" element={<BatchManager />} /></Routes></main></div></div>
  );
}
