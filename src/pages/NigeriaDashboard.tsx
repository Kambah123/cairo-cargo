import { useState, useRef, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import DestinationBadge from '@/components/DestinationBadge';
import StatusBadge from '@/components/StatusBadge';
import {
  Plane, CheckCircle, ClipboardList, LogOut, Search, X, Camera, Phone, Banknote, PackageCheck, AlertTriangle, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment } from '@/types';
import { supabase } from '@/lib/supabase';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [
    { label: 'Arrivals', icon: Plane, path: '/nigeria' },
    { label: 'Pending Deliveries', icon: CheckCircle, path: '/nigeria/deliveries' },
    { label: 'Pickup Log', icon: ClipboardList, path: '/nigeria/pickups' },
    { label: 'Incoming Manifest', icon: FileText, path: '/nigeria/incoming' }
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

function ArrivalModal({ shipment, onClose, onConfirm }: {
  shipment: Shipment; onClose: () => void; onConfirm: (data: { currentWeight: number; conditionNotes: string }) => void;
}) {
  const [currentWeight, setCurrentWeight] = useState(shipment.weight.toString());
  const [conditionNotes, setConditionNotes] = useState('');
  const diff = Math.abs(shipment.weight - parseFloat(currentWeight || '0'));
  const percentDiff = (diff / shipment.weight) * 100;
  const isAlert = percentDiff > 5 || diff > 2;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Confirm Arrival</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="p-6 space-y-6"><div className="p-4 bg-[#F8F9FA] border rounded-xl"><p className="text-lg font-mono font-bold">{shipment.trackingNumber}</p><p className="text-sm text-[#4A5568]">{shipment.senderName} → {shipment.receiverName}</p></div>
          <div className="space-y-4"><div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Final Weight (kg)</label><input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} step="0.01" className={`w-full h-12 px-4 border rounded-xl ${isAlert ? 'border-orange-300 bg-orange-50' : ''}`} />{isAlert && <p className="text-xs text-orange-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Discrepancy detected!</p>}</div>
            <textarea value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} placeholder="Condition notes..." rows={3} className="w-full px-4 py-3 border rounded-xl" />
          </div><button onClick={() => { onConfirm({ currentWeight: parseFloat(currentWeight) || 0, conditionNotes }); onClose(); }} className="w-full h-12 bg-[#1B4332] text-white font-bold rounded-xl shadow-lg">Confirm Arrival</button>
        </div>
      </div>
    </div>
  );
}

function DeliveryModal({ shipment, onClose, onConfirm }: {
  shipment: Shipment; onClose: () => void; onConfirm: (data: { collectorName: string; collectorPhone: string, cashCollected: number, photoFile: File | null }) => void;
}) {
  const [collectorName, setCollectorName] = useState('');
  const [collectorPhone, setCollectorPhone] = useState('');
  const [cashCollected, setCashCollected] = useState(shipment.balanceDue.toString());
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-[#38A169] text-white"><h3 className="text-xl font-bold">Complete Handover</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div><p className="text-sm font-bold text-gray-500 uppercase">Shipment ID</p><p className="font-mono font-bold text-lg">{shipment.trackingNumber}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-gray-500 uppercase">Balance Due</p><p className="font-bold text-xl text-red-600">${shipment.balanceDue}</p></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Collector Name</label><input value={collectorName} onChange={e => setCollectorName(e.target.value)} placeholder="Who is picking up?" className="w-full h-12 px-4 border rounded-xl" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Collector Phone</label><input value={collectorPhone} onChange={e => setCollectorPhone(e.target.value)} placeholder="Phone number" className="w-full h-12 px-4 border rounded-xl" /></div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Cash Collected ($)</label>
                <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="number" value={cashCollected} onChange={e => setCashCollected(e.target.value)} className="w-full h-14 pl-12 pr-4 border-2 border-green-100 rounded-xl bg-green-50/30 font-bold text-lg" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400">Photo Proof (Mandatory)</label>
                <div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50">
                    {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-400"><Camera className="w-6 h-6 mb-1" /><span className="text-[10px]">Tap to take photo</span></div>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            </div>

            <button onClick={() => {
                if (!photoFile) { toast.error('Photo required for proof'); return; }
                onConfirm({ collectorName, collectorPhone, cashCollected: parseFloat(cashCollected) || 0, photoFile });
                onClose();
            }} className="w-full h-14 bg-[#38A169] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2">
                <PackageCheck className="w-5 h-5" /> Complete Handover
            </button>
        </div>
      </div>
    </div>
  );
}

function Arrivals() {
  const { shipments, confirmArrival } = useData();
  const { user } = useAuth();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [search, setSearch] = useState('');
  const myBranch = user?.branch || 'all';

  const arrivalsList = useMemo(() => {
    return shipments.filter((s) =>
        (s.status === 'shipped' || s.status === 'departed' || s.status === 'flight_booked') &&
        (myBranch === 'all' || s.destination === myBranch) &&
        (!search || s.trackingNumber.toLowerCase().includes(search.toLowerCase()))
    );
  }, [shipments, myBranch, search]);

  const handleConfirm = async (data: { currentWeight: number; conditionNotes: string }) => {
    if (!selectedShipment || !user) return;
    try {
        await confirmArrival(selectedShipment.id, {
            confirmedAt: new Date().toISOString(),
            confirmedBy: user.id,
            currentWeight: data.currentWeight,
            conditionNotes: data.conditionNotes
        });
        toast.success('Arrival confirmed');
    } catch { toast.error('Failed to confirm arrival'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8"><h1 className="text-2xl font-bold">Arrivals</h1><div className="mb-6 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tracking ID..." className="w-full h-14 pl-12 pr-4 border rounded-2xl shadow-sm bg-white" /></div>
      <div className="space-y-4">{arrivalsList.map(s => (
          <div key={s.id} className="bg-white border p-6 rounded-2xl flex justify-between items-center shadow-sm hover:border-[#1B4332] transition-colors">
            <div className="flex gap-4 items-center">
                <div className="p-3 bg-gray-50 rounded-xl"><Plane className="w-6 h-6 text-[#1B4332]" /></div>
                <div><p className="font-mono font-bold text-lg">{s.trackingNumber}</p><p className="text-sm text-gray-500">{s.senderName} → {s.receiverName}</p></div>
            </div>
            <button onClick={() => setSelectedShipment(s)} className="h-12 px-8 bg-[#1B4332] text-white font-bold rounded-xl shadow-md">Process Arrival</button>
          </div>
      ))}
      {arrivalsList.length === 0 && <div className="py-20 text-center text-gray-400 flex flex-col items-center"><Plane className="w-12 h-12 mb-4 opacity-20" /><p>No shipments currently arriving</p></div>}
      </div>{selectedShipment && <ArrivalModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} onConfirm={handleConfirm} />}
    </div>
  );
}

function Deliveries() {
  const { shipments, confirmDelivery, updateShipment } = useData();
  const { user } = useAuth();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [search, setSearch] = useState('');
  const myBranch = user?.branch || 'all';

  const readyForPickup = useMemo(() => {
    return shipments.filter((s) =>
        (s.status === 'arrived' || s.status === 'ready_for_pickup') &&
        (myBranch === 'all' || s.destination === myBranch) &&
        (!search || s.trackingNumber.toLowerCase().includes(search.toLowerCase()))
    );
  }, [shipments, myBranch, search]);

  const handleConfirm = async (data: { collectorName: string; collectorPhone: string, cashCollected: number, photoFile: File | null }) => {
    if (!selectedShipment || !user) return;
    try {
        let pickupPhotoUrl = '';
        if (data.photoFile) {
            const fileName = `pickup_${selectedShipment.id}.${data.photoFile.name.split('.').pop()}`;
            const { error } = await supabase.storage.from('cargo-photos').upload(`pickups/${fileName}`, data.photoFile);
            if (!error) pickupPhotoUrl = supabase.storage.from('cargo-photos').getPublicUrl(`pickups/${fileName}`).data.publicUrl;
        }

        await confirmDelivery(selectedShipment.id, {
            collectorName: data.collectorName,
            collectorPhone: data.collectorPhone,
            deliveredAt: new Date().toISOString(),
            confirmedBy: user.id,
            cashCollected: data.cashCollected
        });

        if (pickupPhotoUrl) {
            await updateShipment(selectedShipment.id, { pickupPhotoUrl });
        }

        toast.success('Handover complete');
    } catch { toast.error('Failed to process handover'); }
  };

  const handleRefusal = async (s: Shipment) => {
    const reason = window.prompt('Reason for refusal:');
    if (reason) {
        try {
            await updateShipment(s.id, { status: 'returned', refusalReason: reason });
            toast.success('Marked as returned');
        } catch { toast.error('Failed'); }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8"><h1 className="text-2xl font-bold">Pending Handover</h1><div className="mb-6 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search receiver or tracking..." className="w-full h-14 pl-12 pr-4 border rounded-2xl bg-white shadow-sm" /></div>
       <div className="space-y-4">{readyForPickup.map(s => (
           <div key={s.id} className="bg-white border p-6 rounded-2xl flex justify-between items-center shadow-sm">
             <div>
                <p className="font-mono font-bold text-lg">{s.trackingNumber}</p>
                <p className="text-sm font-medium text-gray-700">{s.receiverName}</p>
                <div className="flex gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.balanceDue > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {s.balanceDue > 0 ? `Due: $${s.balanceDue}` : 'Fully Paid'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold">{s.weight}kg</span>
                </div>
             </div>
             <div className="flex gap-2">
                <button onClick={() => handleRefusal(s)} className="h-12 px-4 border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50">Refused</button>
                <button onClick={() => setSelectedShipment(s)} className="h-12 px-6 bg-[#38A169] text-white font-bold rounded-xl shadow-md">Complete Handover</button>
             </div>
           </div>
       ))}
       {readyForPickup.length === 0 && <div className="py-20 text-center text-gray-400 flex flex-col items-center"><CheckCircle className="w-12 h-12 mb-4 opacity-20" /><p>No shipments ready for handover</p></div>}
       </div>{selectedShipment && <DeliveryModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} onConfirm={handleConfirm} />}
    </div>
  );
}

function PickupLog() {
  const { shipments } = useData();
  const { user } = useAuth();
  const myBranch = user?.branch || 'all';
  const delivered = useMemo(() => {
    return shipments.filter(s => s.status === 'delivered' && s.deliveryConfirmation && (myBranch === 'all' || s.destination === myBranch));
  }, [shipments, myBranch]);

  return (
    <div className="max-w-6xl mx-auto space-y-6"><h1 className="text-2xl font-bold">Pickup Log</h1><div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Tracking ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Collector Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Handover Time</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Financials</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Proof</th>
                </tr>
            </thead>
           <tbody className="divide-y">{delivered.map(s => (
             <tr key={s.id}>
                <td className="px-6 py-4 font-mono font-bold text-sm">{s.trackingNumber}</td>
                <td className="px-6 py-4">
                    <p className="text-sm font-bold">{s.deliveryConfirmation!.collectorName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400"><Phone className="w-3 h-3" />{s.deliveryConfirmation!.collectorPhone}</div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-500">{new Date(s.deliveryConfirmation!.deliveredAt).toLocaleString()}</td>
                <td className="px-6 py-4">
                    <span className="text-sm font-bold text-green-600">${s.deliveryConfirmation!.cashCollected || 0}</span>
                    <p className="text-[10px] text-gray-400">collected</p>
                </td>
                <td className="px-6 py-4">
                    {s.pickupPhotoUrl ? (
                        <a href={s.pickupPhotoUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 rounded-lg inline-block hover:bg-gray-200"><Camera className="w-4 h-4 text-gray-500" /></a>
                    ) : '-'}
                </td>
             </tr>
           ))}</tbody>
        </table>
        {delivered.length === 0 && <div className="py-20 text-center text-gray-400">No handover records yet</div>}
    </div>
    </div>
  );
}

function IncomingManifest() {
    const { batches, shipments } = useData();
    const { user } = useAuth();
    const myBranch = user?.branch || 'all';

    const incomingBatches = useMemo(() => {
        return batches.filter(b =>
            (b.status === 'shipped' || b.status === 'departed' || b.status === 'flight_booked') &&
            (myBranch === 'all' || b.destination === myBranch)
        );
    }, [batches, myBranch]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Incoming Flight Manifests</h1>
            <div className="grid grid-cols-1 gap-6">
                {incomingBatches.map(b => (
                    <div key={b.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg font-mono">{b.id}</h3>
                                <p className="text-xs text-gray-500">Destination: {b.destination.toUpperCase()} | Flight: {new Date(b.flightDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-bold">{b.shipmentCount} Items</p>
                                    <p className="text-xs text-gray-500">{b.totalWeight.toFixed(1)} kg Total</p>
                                </div>
                                <StatusBadge status={b.status as any} />
                            </div>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase text-gray-400">
                                        <th className="pb-4">Tracking ID</th>
                                        <th className="pb-4">Sender</th>
                                        <th className="pb-4">Receiver</th>
                                        <th className="pb-4">Weight</th>
                                        <th className="pb-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {shipments.filter(s => s.batchId === b.id).map(s => (
                                        <tr key={s.id}>
                                            <td className="py-3 font-mono text-sm font-bold">{s.trackingNumber}</td>
                                            <td className="py-3 text-xs">{s.senderName}</td>
                                            <td className="py-3 text-xs">{s.receiverName}</td>
                                            <td className="py-3 text-xs">{s.weight}kg</td>
                                            <td className="py-3"><StatusBadge status={s.status} size="sm" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
                {incomingBatches.length === 0 && <div className="py-20 text-center text-gray-400 border-2 border-dashed rounded-2xl">No incoming manifests currently</div>}
            </div>
        </div>
    );
}

export default function NigeriaDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><div className="flex pt-14"><Sidebar /><main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]"><Routes><Route path="/" element={<Arrivals />} /><Route path="/deliveries" element={<Deliveries />} /><Route path="/pickups" element={<PickupLog />} /><Route path="/incoming" element={<IncomingManifest />} /></Routes></main></div></div>
  );
}
