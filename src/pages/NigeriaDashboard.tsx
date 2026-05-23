import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import DestinationBadge from '@/components/DestinationBadge';
import {
  Plane, CheckCircle, ClipboardList, LogOut, Search, X
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [{ label: 'Arrivals', icon: Plane, path: '/nigeria' }, { label: 'Deliveries', icon: CheckCircle, path: '/nigeria/deliveries' }, { label: 'Pickup Log', icon: ClipboardList, path: '/nigeria/pickups' }];
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
          <div className="space-y-4"><div className="space-y-1.5"><label className="text-xs font-semibold uppercase">Final Weight (kg)</label><input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} step="0.01" className={`w-full h-12 px-4 border rounded-xl ${isAlert ? 'border-orange-300 bg-orange-50' : ''}`} />{isAlert && <p className="text-xs text-orange-600 font-bold">Discrepancy!</p>}</div>
            <textarea value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} placeholder="Condition notes..." rows={3} className="w-full px-4 py-3 border rounded-xl" />
          </div><button onClick={() => { onConfirm({ currentWeight: parseFloat(currentWeight) || 0, conditionNotes }); onClose(); }} className="w-full h-12 bg-[#1B4332] text-white font-bold rounded-xl">Confirm Arrival</button>
        </div>
      </div>
    </div>
  );
}

function DeliveryModal({ shipment, onClose, onConfirm }: {
  shipment: Shipment; onClose: () => void; onConfirm: (data: { collectorName: string; collectorPhone: string }) => void;
}) {
  const [collectorName, setCollectorName] = useState('');
  const [collectorPhone, setCollectorPhone] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Confirm Delivery</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="p-6 space-y-4"><p className="text-sm font-bold">{shipment.trackingNumber}</p><input value={collectorName} onChange={e => setCollectorName(e.target.value)} placeholder="Collector Name" className="w-full h-12 px-4 border rounded-xl" /><input value={collectorPhone} onChange={e => setCollectorPhone(e.target.value)} placeholder="Phone" className="w-full h-12 px-4 border rounded-xl" /><button onClick={() => { onConfirm({ collectorName, collectorPhone }); onClose(); }} className="w-full h-12 bg-[#38A169] text-white font-bold rounded-xl">Complete Delivery</button></div>
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
  const arrivalsList = shipments.filter((s) => (s.status === 'shipped' || s.status === 'awaiting_flight') && (myBranch === 'all' || s.destination === myBranch) && (!search || s.trackingNumber.toLowerCase().includes(search.toLowerCase())));
  const handleConfirm = async (data: { currentWeight: number; conditionNotes: string }) => {
    if (!selectedShipment || !user) return;
    try { await confirmArrival(selectedShipment.id, { confirmedAt: new Date().toISOString(), confirmedBy: user.id, currentWeight: data.currentWeight, conditionNotes: data.conditionNotes }); toast.success('Confirmed'); } catch { toast.error('Failed'); }
  };
  return (
    <div className="max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-8">Arrivals</h1><div className="mb-6 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full h-14 pl-12 pr-4 border rounded-2xl" /></div>
      <div className="space-y-4">{arrivalsList.map(s => (
          <div key={s.id} className="bg-white border p-6 rounded-2xl flex justify-between items-center"><div><p className="font-mono font-bold">{s.trackingNumber}</p><p className="text-sm text-gray-500">{s.senderName} → {s.receiverName}</p></div><button onClick={() => setSelectedShipment(s)} className="h-12 px-6 bg-[#1B4332] text-white font-bold rounded-xl">Process</button></div>
      ))}</div>{selectedShipment && <ArrivalModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} onConfirm={handleConfirm} />}
    </div>
  );
}

function Deliveries() {
  const { shipments, confirmDelivery } = useData();
  const { user } = useAuth();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filter] = useState('');
  const myBranch = user?.branch || 'all';
  const readyForPickup = shipments.filter((s) => s.status === 'arrived' && (myBranch === 'all' || s.destination === myBranch) && (!filter || s.trackingNumber.toLowerCase().includes(filter.toLowerCase())));
  const handleConfirm = async (data: { collectorName: string; collectorPhone: string }) => {
    if (!selectedShipment || !user) return;
    try { await confirmDelivery(selectedShipment.id, { collectorName: data.collectorName, collectorPhone: data.collectorPhone, deliveredAt: new Date().toISOString(), confirmedBy: user.id }); toast.success('Delivered'); } catch { toast.error('Failed'); }
  };
  return (
    <div className="max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-6">Pending Deliveries</h1>
       <div className="space-y-4">{readyForPickup.map(s => (
           <div key={s.id} className="bg-white border p-6 rounded-2xl flex justify-between items-center"><div><p className="font-mono font-bold">{s.trackingNumber}</p><p className="text-sm">{s.receiverName}</p></div><button onClick={() => setSelectedShipment(s)} className="h-12 px-6 bg-[#38A169] text-white font-bold rounded-xl">Handover</button></div>
       ))}</div>{selectedShipment && <DeliveryModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} onConfirm={handleConfirm} />}
    </div>
  );
}

function PickupLog() {
  const { shipments } = useData();
  const { user } = useAuth();
  const myBranch = user?.branch || 'all';
  const delivered = shipments.filter(s => s.status === 'delivered' && s.deliveryConfirmation && (myBranch === 'all' || s.destination === myBranch));
  return (
    <div className="max-w-6xl mx-auto"><h1 className="text-2xl font-bold mb-6">Pickup Log</h1><div className="bg-white border rounded-2xl overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="px-6 py-4">Tracking ID</th><th className="px-6 py-4">Collector</th><th className="px-6 py-4">Time</th><th className="px-6 py-4">Dest</th></tr></thead>
           <tbody className="divide-y">{delivered.map(s => (
             <tr key={s.id}><td className="px-6 py-4 font-mono font-bold">{s.trackingNumber}</td><td className="px-6 py-4">{s.deliveryConfirmation!.collectorName}</td><td className="px-6 py-4 text-sm">{new Date(s.deliveryConfirmation!.deliveredAt).toLocaleString()}</td><td className="px-4 py-3"><DestinationBadge destination={s.destination} size="sm" /></td></tr>
           ))}</tbody></table></div>
    </div>
  );
}

export default function NigeriaDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><div className="flex pt-14"><Sidebar /><main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]"><Routes><Route path="/" element={<Arrivals />} /><Route path="/deliveries" element={<Deliveries />} /><Route path="/pickups" element={<PickupLog />} /></Routes></main></div></div>
  );
}
