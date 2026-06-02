import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Camera, CheckCircle2, ChevronRight, User, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment, Destination, PriorityLabel } from '@/types';
import ShipmentTag from './ShipmentTag';
import WhatsAppButton from './WhatsAppButton';

export default function CreateShipment({ initialData, onComplete }: { initialData?: Partial<Shipment>, onComplete?: () => void }) {
  const { addShipment, updateShipment } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);
  const [step] = useState<'customer' | 'details' | 'payment'>('customer');

  const [formData, setFormData] = useState({
    senderName: initialData?.senderName || '',
    senderPhone: initialData?.senderPhone || '',
    receiverName: initialData?.receiverName || '',
    receiverPhone: initialData?.receiverPhone || '',
    destination: initialData?.destination || 'kano' as Destination,
    itemDescription: initialData?.itemDescription || '',
    weight: initialData?.weight?.toString() || '',
    totalAmount: initialData?.totalAmount?.toString() || '',
    paidAmount: initialData?.paidAmount || 0,
    priority: (initialData?.priorityLabels?.includes('express') ? 'express' : 'standard') as 'standard' | 'express',
    isFragile: initialData?.priorityLabels?.includes('fragile') || false
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

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
    if (!photoFile && !initialData?.photoUrl) { toast.error('Intake photo is mandatory'); return; }
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
      const paidAmt = Number(formData.paidAmount) || 0;

      const labels: PriorityLabel[] = [];
      if (formData.priority === 'express') labels.push('express');
      if (formData.isFragile) labels.push('fragile');
      if (paidAmt >= totalAmt) labels.push('paid');
      else labels.push('balance_due');

      if (isEditing) {
        await updateShipment(trackingNumber, {
          senderName: formData.senderName, senderPhone: formData.senderPhone,
          receiverName: formData.receiverName, receiverPhone: formData.receiverPhone,
          destination: formData.destination, itemDescription: formData.itemDescription,
          weight: parseFloat(formData.weight), totalAmount: totalAmt, paidAmount: paidAmt,
          balanceDue: totalAmt - paidAmt, photoUrl, priorityLabels: labels,
          updatedAt: new Date().toISOString()
        });
        toast.success('Shipment updated successfully');
        if (onComplete) onComplete();
      } else {
        const shipment: Shipment = {
          id: trackingNumber, trackingNumber, senderName: formData.senderName,
          senderPhone: formData.senderPhone, receiverName: formData.receiverName,
          receiverPhone: formData.receiverPhone, destination: formData.destination,
          itemDescription: formData.itemDescription, weight: parseFloat(formData.weight),
          weightUnit: 'kg', photoUrl: photoUrl || undefined,
          priorityLabels: labels,
          totalAmount: totalAmt, paidAmount: paidAmt, balanceDue: totalAmt - paidAmt,
          status: 'received', createdBy: user?.id || 'unknown',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        await addShipment(shipment);
        setCreatedShipment(shipment);
        toast.success('Shipment registered successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdShipment) {
    return (
      <div className="max-w-xl mx-auto p-4 animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] border shadow-2xl overflow-hidden">
          <div className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto text-green-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Success!</h2>
              <p className="text-muted-foreground">Shipment registered and labeled</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl font-mono font-black text-2xl tracking-tighter text-[#1B4332] border-2 border-dashed border-gray-200">
              {createdShipment.trackingNumber}
            </div>
            <div className="flex justify-center py-4">
              <ShipmentTag shipment={createdShipment} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCreatedShipment(null)} className="h-14 font-black uppercase text-gray-400">Add Another</button>
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin/shipments' : '/cairo/shipments')}
                className="h-14 bg-[#1B4332] text-white rounded-2xl font-black uppercase shadow-xl"
              >
                View Details
              </button>
            </div>
            <WhatsAppButton shipment={createdShipment} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#1B4332] uppercase">{initialData?.id ? 'Edit Parcel' : 'New Shipment'}</h1>
          <p className="text-muted-foreground font-bold">Fast-track intake workflow</p>
        </div>
        <div className="hidden md:flex gap-2">
           {['customer', 'details', 'payment'].map((s: any) => (
             <div key={s} className={`h-2 w-12 rounded-full ${step === s ? 'bg-[#1B4332]' : 'bg-gray-200'}`} />
           ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: People */}
          <div className="bg-white border-2 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
             <h3 className="text-lg font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><User className="w-5 h-5" /> Customer Intel</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Sender Name</label>
                   <input required placeholder="Full Name" value={formData.senderName} onChange={e => updateField('senderName', e.target.value)} className="w-full h-14 px-6 border-2 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-[#1B4332] outline-none transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Sender Phone</label>
                   <input required type="tel" placeholder="+20..." value={formData.senderPhone} onChange={e => updateField('senderPhone', e.target.value)} className="w-full h-14 px-6 border-2 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-[#1B4332] outline-none transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Receiver Name</label>
                   <input required placeholder="Full Name" value={formData.receiverName} onChange={e => updateField('receiverName', e.target.value)} className="w-full h-14 px-6 border-2 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-[#1B4332] outline-none transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Receiver Phone</label>
                   <input required type="tel" placeholder="+234..." value={formData.receiverPhone} onChange={e => updateField('receiverPhone', e.target.value)} className="w-full h-14 px-6 border-2 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-[#1B4332] outline-none transition-all font-bold" />
                </div>
             </div>
          </div>

          {/* Step 2: Parcel */}
          <div className="bg-white border-2 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
             <h3 className="text-lg font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Package className="w-5 h-5" /> Parcel Logistics</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Destination</label>
                   <div className="grid grid-cols-3 gap-2">
                     {(['kano', 'abuja', 'lagos'] as Destination[]).map(d => (
                       <button
                        key={d}
                        type="button"
                        onClick={() => updateField('destination', d)}
                        className={`h-14 rounded-2xl border-2 font-black uppercase text-[10px] transition-all ${formData.destination === d ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'bg-gray-50 border-transparent text-gray-400'}`}
                       >
                         {d}
                       </button>
                     ))}
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Weight (kg)</label>
                   <input required type="number" step="0.1" inputMode="decimal" placeholder="0.0" value={formData.weight} onChange={e => updateField('weight', e.target.value)} className="w-full h-14 px-6 border-2 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-[#1B4332] outline-none transition-all font-black text-2xl text-[#1B4332]" />
                </div>
                <div className="col-span-full space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Item Description</label>
                   <textarea required placeholder="What's inside? (e.g. Clothes, Electronics)" value={formData.itemDescription} onChange={e => updateField('itemDescription', e.target.value)} className="w-full h-24 p-6 border-2 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-[#1B4332] outline-none transition-all font-bold resize-none" />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Intake Photo */}
          <div className="bg-white border-2 rounded-[2.5rem] p-8 space-y-4 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Intake Photo</h3>
             <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-4 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:bg-gray-100 transition-all group relative"
             >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                       <Camera className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Capture Parcel</p>
                  </>
                )}
             </div>
             <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" capture="environment" className="hidden" />
          </div>

          {/* Payment Intel */}
          <div className="bg-white border-2 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Financials</h3>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Total Quote ($)</label>
                   <input required type="number" inputMode="numeric" placeholder="0" value={formData.totalAmount} onChange={e => updateField('totalAmount', e.target.value)} className="w-full h-14 px-6 border-2 rounded-2xl bg-gray-50/50 focus:bg-white focus:border-[#1B4332] outline-none transition-all font-black text-2xl text-blue-600" />
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-gray-400 ml-4">Payment Status</p>
                   <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('paidAmount', formData.totalAmount)}
                        className={`flex-1 h-12 rounded-xl border-2 font-bold text-xs transition-all ${Number(formData.paidAmount) >= Number(formData.totalAmount) && Number(formData.totalAmount) > 0 ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'bg-gray-50 text-gray-400'}`}
                      >
                        FULLY PAID
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('paidAmount', 0)}
                        className={`flex-1 h-12 rounded-xl border-2 font-bold text-xs transition-all ${Number(formData.paidAmount) === 0 ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-400'}`}
                      >
                        DEBT
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-20 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-[#1B4332]/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {initialData?.id ? 'Update Parcel' : 'Register Shipment'}
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
