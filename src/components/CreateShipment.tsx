import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment, Destination } from '@/types';
import ShipmentTag from './ShipmentTag';

export default function CreateShipment({ initialData, onComplete }: { initialData?: Partial<Shipment>, onComplete?: () => void }) {
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
           <div className="flex gap-4"><button onClick={() => setCreatedShipment(null)} className="flex-1 h-12 border rounded-xl">Create Another</button><button onClick={() => navigate(user?.role === 'admin' ? '/admin/shipments' : '/cairo/shipments')} className="flex-1 h-12 bg-[#1B4332] text-white rounded-xl">View Shipments</button></div>
        </div>
      )}
    </div>
  );
}
