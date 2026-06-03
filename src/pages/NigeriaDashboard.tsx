import { useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import SackManager from '@/pages/SackManager';
import GlobalSearch from '@/pages/GlobalSearch';
import { List, Layers, LogOut, Search, ChevronRight, Phone, DollarSign, User, Camera, Package, Truck, Activity, ShieldCheck } from 'lucide-react';
import type { Shipment } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [
    { label: 'Intelligence', icon: Activity, path: '/nigeria' },
    { label: 'Arrival Scan', icon: Truck, path: '/nigeria/arrivals' },
    { label: 'Sack Manager', icon: Layers, path: '/nigeria/sacks' },
    { label: 'Ready for Pickup', icon: Package, path: '/nigeria/deliveries' },
    { label: 'Handover Log', icon: List, path: '/nigeria/pickups' },
    { label: 'Master Search', icon: Search, path: '/nigeria/search' }
  ];
  return (
    <aside className="hidden md:flex w-[280px] flex-col bg-white border-r border-slate-100 h-[calc(100vh-64px)] sticky top-16 shadow-sm">
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
           <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              location.pathname === item.path
                ? 'bg-[#1B4332] text-white shadow-lg shadow-[#1B4332]/20'
                : 'text-slate-500 hover:text-[#1B4332] hover:bg-slate-50'
            }`}
           >
             <item.icon className="w-4 h-4" />
             {item.label}
           </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="w-4 h-4" /> Secure Exit
        </button>
      </div>
    </aside>
  );
}

function Arrivals() {
  const { shipments, updateShipment } = useData();
  const { user } = useAuth();
  const shipped = useMemo(() => {
    return shipments.filter(s => s.status === 'shipped' && (user?.branch === 'all' || s.destination === user?.branch));
  }, [shipments, user]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-[#1A202C] uppercase">Inbound <span className="text-[#1B4332]">Manifest</span></h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Parcels currently in transit to {user?.branch} branch</p>
        </div>
        <div className="flex gap-4">
           <button className="h-14 px-8 bg-[#1B4332] text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-[#1B4332]/20 flex items-center gap-3 active:scale-95 transition-all hover:bg-[#2D6A4F]">
              <Truck className="w-5 h-5" /> Bulk Arrival Scan
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'In Transit', value: shipped.length, icon: Truck, color: 'text-[#1B4332]' },
           { label: 'Sack Volume', value: Math.ceil(shipped.length / 5), icon: Layers, color: 'text-purple-600' },
           { label: 'Expected Wgt', value: shipped.reduce((acc, s) => acc + s.weight, 0).toFixed(1) + 'kg', icon: Activity, color: 'text-emerald-600' },
           { label: 'Priority Hub', value: user?.branch?.toUpperCase(), icon: ShieldCheck, color: 'text-orange-600' }
         ].map((stat, i) => (
           <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center ${stat.color} border border-slate-100`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-3xl font-black text-[#1A202C] mt-1">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                  <th className="px-10 py-6">ID Protocol</th>
                  <th className="px-10 py-6">Receiver Intel</th>
                  <th className="px-10 py-6">Current State</th>
                  <th className="px-10 py-6 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {shipped.map(s => (
                 <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-10 py-8 font-mono font-black text-[#1B4332] text-lg tracking-tighter">{s.trackingNumber}</td>
                    <td className="px-10 py-8">
                       <p className="font-black text-[#1A202C] text-xs uppercase mb-1">{s.receiverName}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.weight}kg • {s.destination}</p>
                    </td>
                    <td className="px-10 py-8"><StatusBadge status={s.status} size="sm" /></td>
                    <td className="px-10 py-8 text-right">
                       <button
                        onClick={() => updateShipment(s.id, { status: 'arrived' })}
                        className="px-6 py-3 bg-slate-50 text-[#1B4332] font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-[#1B4332] hover:text-white transition-all active:scale-95 border border-slate-200"
                       >
                         Log Arrival
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
         {shipped.length === 0 && <div className="py-32 text-center text-slate-400 font-black uppercase tracking-widest">No inbound manifests found</div>}
      </div>
    </div>
  );
}

function Deliveries() {
  const { shipments, updateShipment } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const readyForPickup = useMemo(() => {
    return shipments.filter(s =>
      ['arrived', 'ready_for_pickup'].includes(s.status) &&
      (user?.branch === 'all' || s.destination === user?.branch) &&
      (s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shipments, user, searchTerm]);

  const handleHandover = async (id: string, data: any) => {
    await updateShipment(id, {
      status: 'delivered',
      deliveryConfirmation: {
        ...data,
        deliveredAt: new Date().toISOString(),
        confirmedBy: user?.name || 'System'
      }
    });
    setSelectedShipment(null);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-[#1A202C] uppercase">Pickup <span className="text-[#1B4332]">Center</span></h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Final stage handover and cash collection protocol</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input
            placeholder="Search tracking or name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-[#1A202C] focus:border-[#1B4332] outline-none transition-all shadow-sm"
           />
        </div>
      </div>

      <div className="space-y-4">
        {readyForPickup.map(s => (
          <div key={s.id} className="bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 hover:shadow-xl transition-all group">
             <div className="flex-1 w-full space-y-4 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <p className="font-mono font-black text-3xl tracking-tighter text-[#1B4332]">{s.trackingNumber}</p>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.balanceDue > 0 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {s.balanceDue > 0 ? `DEBT: $${s.balanceDue}` : 'PROTOCOL CLEAR'}
                  </div>
                </div>
                <p className="text-xl font-black text-[#1A202C] uppercase tracking-tight">{s.receiverName}</p>
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 font-bold">
                  <Phone className="w-4 h-4" /> {s.receiverPhone}
                </div>
             </div>

             <button
              onClick={() => setSelectedShipment(s)}
              className="w-full md:w-auto h-20 px-12 bg-[#1B4332] text-white font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] shadow-xl shadow-[#1B4332]/20 active:scale-95 transition-all flex items-center justify-center gap-4 group hover:bg-[#2D6A4F]"
             >
               Commence Handover <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
             </button>
          </div>
        ))}
        {readyForPickup.length === 0 && <div className="py-32 text-center text-slate-400 font-black uppercase tracking-widest border-4 border-dashed border-slate-100 rounded-[4rem]">No parcels in pickup queue</div>}
      </div>

      {selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-6 overflow-auto">
           <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
             <div className="p-10 border-b border-slate-100 text-center space-y-4 bg-slate-50">
                <h2 className="text-3xl font-black tracking-tighter text-[#1A202C] uppercase">Security Clearance</h2>
                <div className="inline-block px-6 py-2 bg-[#1B4332]/10 rounded-full border border-[#1B4332]/20">
                   <p className="text-[#1B4332] font-mono font-black text-sm uppercase tracking-[0.2em]">{selectedShipment.trackingNumber}</p>
                </div>
             </div>

             <form className="p-12 space-y-8" onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               handleHandover(selectedShipment.id, {
                 collectorName: formData.get('collectorName'),
                 collectorPhone: formData.get('collectorPhone'),
                 cashCollected: Number(formData.get('cashCollected'))
               });
             }}>
               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-6">Collector Identity</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                      <input name="collectorName" required placeholder="Full Name" className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-3xl focus:border-[#1B4332] outline-none font-black text-[#1A202C]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-6">Contact Frequency</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                      <input name="collectorPhone" required placeholder="+234..." className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-3xl focus:border-[#1B4332] outline-none font-black text-[#1A202C]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-6">Financial Settlement ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
                      <input name="cashCollected" type="number" defaultValue={selectedShipment.balanceDue} className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-3xl focus:border-emerald-500 outline-none font-black text-emerald-600 text-3xl tracking-tighter" />
                    </div>
                  </div>
               </div>

               <div className="flex gap-6 pt-6">
                 <button type="button" onClick={() => setSelectedShipment(null)} className="flex-1 h-16 font-black uppercase text-slate-400 tracking-widest hover:text-[#1A202C] transition-all">Abort</button>
                 <button type="submit" className="flex-1 h-16 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-[#1B4332]/20 active:scale-95 transition-all hover:bg-[#2D6A4F]">Verify Handover</button>
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
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-[#1A202C] uppercase">Handover <span className="text-[#1B4332]">Archives</span></h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Immutable ledger of successful delivery events</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                  <th className="px-10 py-6">ID / Destination</th>
                  <th className="px-10 py-6">Collector Intelligence</th>
                  <th className="px-10 py-6">Time-Stamp</th>
                  <th className="px-10 py-6">Yield</th>
                  <th className="px-10 py-6 text-right">Evidence</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {delivered.map(s => (
                 <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-8">
                       <p className="font-mono font-black text-lg text-[#1B4332] mb-2 tracking-tighter">{s.trackingNumber}</p>
                       <DestinationBadge destination={s.destination} size="sm" />
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-black text-[#1A202C] text-xs uppercase mb-1">{s.deliveryConfirmation?.collectorName}</p>
                       <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          <Phone className="w-3 h-3" /> {s.deliveryConfirmation?.collectorPhone}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-xs font-black text-[#1A202C] uppercase">{new Date(s.deliveryConfirmation!.deliveredAt).toLocaleDateString()}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{new Date(s.deliveryConfirmation!.deliveredAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2 text-xl font-black text-emerald-600 tracking-tighter">
                          <DollarSign className="w-5 h-5" /> {s.deliveryConfirmation?.cashCollected || 0}
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#1B4332] transition-all border border-slate-100 shadow-sm">
                          <Camera className="w-5 h-5" />
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
          {delivered.length === 0 && <div className="py-32 text-center text-slate-400 font-black uppercase tracking-widest italic">No historical protocols found</div>}
      </div>
    </div>
  );
}

export default function NigeriaDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-8 md:p-12 overflow-auto min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<Arrivals />} />
            <Route path="/arrivals" element={<Arrivals />} />
            <Route path="/sacks" element={<SackManager />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/pickups" element={<PickupLog />} />
            <Route path="/search" element={<GlobalSearch />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
