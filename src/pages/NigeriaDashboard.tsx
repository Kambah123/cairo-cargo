import { useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import SackManager from '@/pages/SackManager';
import GlobalSearch from '@/pages/GlobalSearch';
import {
  Package,
  Truck,
  CheckCircle,
  Search,
  Camera,
  Phone,
  ArrowDownCircle,
  ChevronRight,
  LogOut,
  Layers,
  User,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment, Sack } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [
    { label: 'Overview', icon: Package, path: '/nigeria' },
    { label: 'Sack Arrivals', icon: ArrowDownCircle, path: '/nigeria/arrivals' },
    { label: 'Sack Management', icon: Layers, path: '/nigeria/sacks' },
    { label: 'Intel Search', icon: Search, path: '/nigeria/search' },
    { label: 'Deliveries', icon: CheckCircle, path: '/nigeria/deliveries' },
    { label: 'Pickup Log', icon: Truck, path: '/nigeria/pickups' },
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

function Arrivals() {
  const { sacks, shipments, updateShipment, updateSack } = useData();
  const { user } = useAuth();

  const incomingSacks = useMemo(() => {
    return sacks.filter(s => s.status === 'shipped' && (user?.branch === 'all' || s.destination === user?.branch));
  }, [sacks, user]);

  const handleSackArrival = async (sack: Sack) => {
    await updateSack(sack.id, { status: 'arrived' });
    const sackParcels = shipments.filter(p => p.sackId === sack.id);
    await Promise.all(sackParcels.map(p => updateShipment(p.id, { status: 'arrived' })));
    toast.success('Sack and parcels marked as arrived');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Sack Arrivals</h1>
        <p className="text-muted-foreground">Process incoming shipments from Cairo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incomingSacks.map(sack => (
          <div key={sack.id} className="bg-white border-2 rounded-[2rem] p-6 space-y-6 shadow-sm hover:shadow-xl transition-all">
             <div className="flex justify-between items-start">
               <DestinationBadge destination={sack.destination} size="lg" />
               <StatusBadge status="shipped" size="sm" />
             </div>

             <div className="space-y-1">
               <p className="font-mono font-bold text-lg">{sack.id}</p>
               <p className="text-xs text-muted-foreground font-bold">{sack.parcelCount} Parcels • {sack.totalWeight.toFixed(1)}kg</p>
             </div>

             <button
              onClick={() => handleSackArrival(sack)}
              className="w-full h-14 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#1B4332]/20 active:scale-95 transition-all"
             >
               <CheckCircle className="w-5 h-5" /> Mark Arrived
             </button>
          </div>
        ))}
        {incomingSacks.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 border-4 border-dashed rounded-[3rem]">No incoming sacks for this branch</div>}
      </div>
    </div>
  );
}

function Deliveries() {
  const { shipments, confirmDelivery } = useData();
  const { user } = useAuth();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const readyForPickup = useMemo(() => {
    return shipments.filter(s =>
      s.status === 'arrived' &&
      (user?.branch === 'all' || s.destination === user?.branch) &&
      (s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) || s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shipments, user, searchTerm]);

  const handleHandover = async (id: string, data: any) => {
    await confirmDelivery(id, {
      ...data,
      deliveredAt: new Date().toISOString(),
      confirmedBy: user!.id
    });
    setSelectedShipment(null);
    toast.success('Handover complete');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#1B4332]">Pending Handover</h1>
        <p className="text-muted-foreground">Verify collection and process final delivery</p>
      </div>

      <div className="relative">
        <input
          placeholder="Search by tracking or receiver name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full h-16 pl-14 pr-6 bg-white border-2 rounded-2xl shadow-sm focus:border-[#1B4332] transition-all outline-none text-lg"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        {readyForPickup.map(s => (
          <div key={s.id} className="bg-white border-2 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-lg transition-all group">
             <div className="flex-1 w-full space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <p className="font-mono font-black text-2xl tracking-tighter text-[#1B4332]">{s.trackingNumber}</p>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.balanceDue > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {s.balanceDue > 0 ? `Due: $${s.balanceDue}` : 'Fully Paid'}
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-700">{s.receiverName}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground font-bold">
                  <Phone className="w-3 h-3" /> {s.receiverPhone}
                </div>
             </div>

             <button
              onClick={() => setSelectedShipment(s)}
              className="w-full md:w-auto h-16 px-10 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#1B4332]/10 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               Process Handover <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        ))}
        {readyForPickup.length === 0 && <div className="py-20 text-center text-gray-300 border-4 border-dashed rounded-[3rem]">No parcels ready for collection</div>}
      </div>

      {selectedShipment && (
        <div className="fixed inset-0 z-50 bg-[#1B4332]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-auto">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
             <div className="p-8 border-b text-center space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Delivery Confirmation</h2>
                <p className="text-muted-foreground font-mono font-bold text-sm uppercase tracking-widest">{selectedShipment.trackingNumber}</p>
             </div>

             <form className="p-10 space-y-6" onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               handleHandover(selectedShipment.id, {
                 collectorName: formData.get('collectorName'),
                 collectorPhone: formData.get('collectorPhone'),
                 cashCollected: Number(formData.get('cashCollected'))
               });
             }}>
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Collector Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input name="collectorName" required placeholder="Who is picking up?" className="w-full h-14 pl-12 pr-6 border-2 rounded-2xl focus:border-[#1B4332] outline-none font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input name="collectorPhone" required placeholder="+234..." className="w-full h-14 pl-12 pr-6 border-2 rounded-2xl focus:border-[#1B4332] outline-none font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Cash Collection ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                      <input name="cashCollected" type="number" defaultValue={selectedShipment.balanceDue} className="w-full h-14 pl-12 pr-6 border-2 rounded-2xl focus:border-green-600 outline-none font-bold text-green-600 text-2xl" />
                    </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setSelectedShipment(null)} className="flex-1 h-16 font-black uppercase text-gray-400 tracking-widest">Cancel</button>
                 <button type="submit" className="flex-1 h-16 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl">Handover Complete</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}

function PickupLog() {
  const { shipments } = useData();
  const { user } = useAuth();
  const delivered = useMemo(() => {
    return shipments.filter(s => s.status === 'delivered' && (user?.branch === 'all' || s.destination === user?.branch));
  }, [shipments, user]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Handover Archives</h1>
        <p className="text-muted-foreground">Historical records of successful deliveries</p>
      </div>

      <div className="bg-white border-2 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <th className="px-10 py-6">ID / Destination</th>
                  <th className="px-10 py-6">Collector Details</th>
                  <th className="px-10 py-6">Time</th>
                  <th className="px-10 py-6">Financials</th>
                  <th className="px-10 py-6 text-right">Proof</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {delivered.map(s => (
                 <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8">
                       <p className="font-mono font-black text-lg text-[#1B4332] mb-1">{s.trackingNumber}</p>
                       <DestinationBadge destination={s.destination} size="sm" />
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-bold text-gray-900 mb-1">{s.deliveryConfirmation?.collectorName}</p>
                       <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase">
                          <Phone className="w-3 h-3" /> {s.deliveryConfirmation?.collectorPhone}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-sm font-bold text-gray-700">{new Date(s.deliveryConfirmation!.deliveredAt).toLocaleDateString()}</p>
                       <p className="text-[10px] text-muted-foreground font-bold">{new Date(s.deliveryConfirmation!.deliveredAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-1.5 text-lg font-black text-green-600">
                          <DollarSign className="w-4 h-4" /> {s.deliveryConfirmation?.cashCollected || 0}
                       </div>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Collected</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button className="p-3 bg-[#EDF2F7] rounded-2xl text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-all">
                          <Camera className="w-5 h-5" />
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
          {delivered.length === 0 && <div className="py-24 text-center text-gray-300 italic">No historical records found</div>}
        </div>
      </div>
    </div>
  );
}

export default function NigeriaDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><div className="flex pt-14"><Sidebar /><main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]"><Routes><Route path="/" element={<Arrivals />} /><Route path="/arrivals" element={<Arrivals />} /><Route path="/sacks" element={<SackManager />} /><Route path="/deliveries" element={<Deliveries />} /><Route path="/pickups" element={<PickupLog />} /><Route path="/search" element={<GlobalSearch />} /></Routes></main></div></div>
  );
}
