import { useState, useRef, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import BatchManager from '@/pages/BatchManager';
import ShipmentTag from '@/components/ShipmentTag';
import { Plus, List, Layers, LogOut, Camera, Printer, Search, Copy, Edit2, X, Filter, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment, Destination, PriorityLabel, ShipmentStatus } from '@/types';
import { supabase } from '@/lib/supabase';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [
    { label: 'Create Shipment', icon: Plus, path: '/cairo' },
    { label: 'My Shipments', icon: List, path: '/cairo/shipments' },
    { label: 'Batch Manager', icon: Layers, path: '/cairo/batches' },
    { label: 'Return Shipments', icon: ArrowLeftRight, path: '/cairo/returns' }
  ];
  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-white border-r h-[calc(100vh-56px)] sticky top-14">
      <nav className="flex-1 p-3 space-y-1">{items.map((item) => (
        <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${location.pathname === item.path ? 'bg-[#EDF2F7] text-[#1B4332] border-l-[3px] border-[#1B4332]' : 'text-[#4A5568]'}`}><item.icon className="w-4 h-4" />{item.label}</button>
      ))}</nav>
      <div className="p-3 border-t"><button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E53E3E]"><LogOut className="w-4 h-4" /> Logout</button></div>
    </aside>
  );
}

function CreateShipment({ initialData, onComplete }: { initialData?: Partial<Shipment>, onComplete?: () => void }) {
  const { addShipment, updateShipment } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);
  const [formData, setFormData] = useState({
    senderName: initialData?.senderName || '',
    senderPhone: initialData?.senderPhone || '',
    receiverName: initialData?.receiverName || '',
    receiverPhone: initialData?.receiverPhone || '',
    destination: initialData?.destination || 'kano' as Destination,
    itemDescription: initialData?.itemDescription || '',
    weight: initialData?.weight?.toString() || '',
    totalAmount: initialData?.totalAmount?.toString() || '',
    paidAmount: initialData?.paidAmount?.toString() || '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile && !initialData?.photoUrl) { toast.error('Photo mandatory'); return; }
    setIsSubmitting(true);
    try {
      const isEditing = !!initialData?.id;
      const trackingNumber = isEditing ? initialData!.id! : `${formData.destination === 'kano' ? 'KAN' : 'ABU'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;

      let photoUrl = initialData?.photoUrl || '';
      if (photoFile) {
        const fileName = `${trackingNumber}.${photoFile.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('cargo-photos').upload(`shipments/${fileName}`, photoFile, { upsert: true });
        if (!error) photoUrl = supabase.storage.from('cargo-photos').getPublicUrl(`shipments/${fileName}`).data.publicUrl;
      }

      const totalAmt = parseFloat(formData.totalAmount) || 0;
      const paidAmt = parseFloat(formData.paidAmount) || 0;

      if (isEditing) {
        await updateShipment(trackingNumber, {
          senderName: formData.senderName, senderPhone: formData.senderPhone,
          receiverName: formData.receiverName, receiverPhone: formData.receiverPhone,
          destination: formData.destination, itemDescription: formData.itemDescription,
          weight: parseFloat(formData.weight), totalAmount: totalAmt, paidAmount: paidAmt,
          balanceDue: totalAmt - paidAmt, photoUrl, updatedAt: new Date().toISOString()
        });
        toast.success('Updated');
        if (onComplete) onComplete();
      } else {
        const shipment: Shipment = {
          id: trackingNumber, trackingNumber, senderName: formData.senderName,
          senderPhone: formData.senderPhone, receiverName: formData.receiverName,
          receiverPhone: formData.receiverPhone, destination: formData.destination,
          itemDescription: formData.itemDescription, weight: parseFloat(formData.weight),
          weightUnit: 'kg', photoUrl: photoUrl || undefined,
          priorityLabels: [paidAmt >= totalAmt ? 'paid' : 'balance_due'],
          totalAmount: totalAmt, paidAmount: paidAmt, balanceDue: totalAmt - paidAmt,
          status: 'received', createdBy: user?.id || 'unknown',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        await addShipment(shipment);
        setCreatedShipment(shipment);
        toast.success('Created');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20"><h1 className="text-2xl font-bold mb-6">{initialData?.id ? 'Edit Shipment' : 'Create Shipment'}</h1>
      {!createdShipment ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Sender Name</label><input placeholder="Sender Name" value={formData.senderName} onChange={e => updateField('senderName', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Sender Phone</label><input placeholder="Sender Phone" value={formData.senderPhone} onChange={e => updateField('senderPhone', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Receiver Name</label><input placeholder="Receiver Name" value={formData.receiverName} onChange={e => updateField('receiverName', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Receiver Phone</label><input placeholder="Receiver Phone" value={formData.receiverPhone} onChange={e => updateField('receiverPhone', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Destination</label><select value={formData.destination} onChange={e => updateField('destination', e.target.value as Destination)} className="w-full h-10 border rounded px-3"><option value="kano">Kano</option><option value="abuja">Abuja</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Weight (kg)</label><input type="number" step="0.01" placeholder="Weight" value={formData.weight} onChange={e => updateField('weight', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
                <div className="col-span-2 space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Item Description</label><input placeholder="Item Description" value={formData.itemDescription} onChange={e => updateField('itemDescription', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Total Amount</label><input type="number" placeholder="Total" value={formData.totalAmount} onChange={e => updateField('totalAmount', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Paid Amount</label><input type="number" placeholder="Paid" value={formData.paidAmount} onChange={e => updateField('paidAmount', e.target.value)} className="w-full h-10 border rounded px-3" required /></div>
              </div>
            </div>
            <div className="space-y-6"><div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50">{photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-gray-300" />}</div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" /><button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[#1B4332] text-white font-bold rounded-xl">{isSubmitting ? 'Processing...' : (initialData?.id ? 'Update Shipment' : 'Register Shipment')}</button>
              {initialData?.id && <button type="button" onClick={onComplete} className="w-full h-12 border rounded-xl">Cancel</button>}
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
  const { shipments, deleteShipment } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.senderPhone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const isMine = s.createdBy === user?.id;
      return isMine && matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter, user]);

  const handleDuplicate = (s: Shipment) => {
    const { id, trackingNumber, createdAt, updatedAt, batchId, status, ...rest } = s;
    setEditingShipment({ ...rest, id: '', trackingNumber: '', createdAt: '', updatedAt: '', status: 'received' } as any);
  };

  if (editingShipment) {
    return <CreateShipment initialData={editingShipment} onComplete={() => setEditingShipment(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">My Shipments</h1>
        <div className="flex flex-1 w-full md:w-auto gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input placeholder="Search tracking, names, phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-10 pl-9 pr-4 border rounded-xl bg-white" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-10 border rounded-xl px-3 bg-white text-sm">
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="awaiting_flight">Awaiting Flight</option>
                <option value="shipped">Shipped</option>
                <option value="arrived">Arrived</option>
            </select>
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tracking ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Details</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Financials</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filteredShipments.length > 0 ? filteredShipments.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-sm">{s.trackingNumber}</td>
                            <td className="px-6 py-4">
                                <p className="text-sm font-medium">{s.senderName} → {s.receiverName}</p>
                                <p className="text-[10px] text-gray-500">{s.itemDescription} ({s.weight}kg)</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm font-bold">${s.totalAmount}</p>
                                <p className={`text-[10px] ${s.balanceDue > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {s.balanceDue > 0 ? `Due: $${s.balanceDue}` : 'Fully Paid'}
                                </p>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={s.status} size="sm" /></td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleDuplicate(s)} title="Duplicate" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Copy className="w-4 h-4" /></button>
                                    {s.status === 'received' && (
                                        <button onClick={() => setEditingShipment(s)} title="Edit" className="p-2 hover:bg-gray-100 rounded-lg text-blue-500"><Edit2 className="w-4 h-4" /></button>
                                    )}
                                    <button onClick={() => window.print()} title="Print" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Printer className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No shipments found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function ReturnShipments() {
  const { shipments } = useData();
  const returns = shipments.filter(s => s.status === 'returned');
  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Returns from Nigeria</h1>
        <div className="bg-white border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr><th className="px-6 py-4">Tracking ID</th><th className="px-6 py-4">Original Receiver</th><th className="px-6 py-4">Reason</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y">
                    {returns.map(s => (
                        <tr key={s.id}>
                            <td className="px-6 py-4 font-mono font-bold">{s.trackingNumber}</td>
                            <td className="px-6 py-4">{s.receiverName}</td>
                            <td className="px-6 py-4 text-sm italic">"{s.refusalReason || 'No reason provided'}"</td>
                            <td className="px-6 py-4"><StatusBadge status={s.status} size="sm" /></td>
                        </tr>
                    ))}
                    {returns.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No returned shipments</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default function CairoDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><div className="flex pt-14"><Sidebar /><main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]"><Routes><Route path="/" element={<CreateShipment />} /><Route path="/shipments" element={<MyShipments />} /><Route path="/batches" element={<BatchManager />} /><Route path="/returns" element={<ReturnShipments />} /></Routes></main></div></div>
  );
}
