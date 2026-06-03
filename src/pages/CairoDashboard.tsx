import { useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import BatchManager from '@/pages/BatchManager';
import SackManager from '@/pages/SackManager';
import GlobalSearch from '@/pages/GlobalSearch';
import CreateShipment from '@/components/CreateShipment';
import { Plus, List, Layers, LogOut, Printer, Search, Copy, Edit2, ArrowLeftRight, TrendingUp, Package, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import type { Shipment, ShipmentStatus } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [
    { label: 'Overview', icon: TrendingUp, path: '/cairo' },
    { label: 'Register Parcel', icon: Plus, path: '/cairo/new' },
    { label: 'Operational Feed', icon: Activity, path: '/cairo/shipments' },
    { label: 'Sack Console', icon: Layers, path: '/cairo/sacks' },
    { label: 'Master Search', icon: Search, path: '/cairo/search' },
    { label: 'Returns', icon: ArrowLeftRight, path: '/cairo/returns' }
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

function Overview() {
  const { shipments } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const mine = shipments.filter(s => s.createdBy === user?.id);
    return {
      total: mine.length,
      today: mine.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString()).length,
      pending: mine.filter(s => s.status === 'received').length,
      revenue: mine.reduce((acc, s) => acc + s.totalAmount, 0)
    };
  }, [shipments, user]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-[#1A202C] uppercase">Operational <span className="text-[#1B4332]">Hub</span></h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Cairo Logistics Center • {user?.name}</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <Link to="/cairo/new" className="h-14 px-8 bg-[#1B4332] text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-[#1B4332]/20 flex items-center gap-3 hover:bg-[#2D6A4F] transition-all active:scale-95">
              <Plus className="w-5 h-5" /> Register New Parcel
           </Link>
           <Link to="/cairo/sacks" className="h-14 px-8 bg-white text-[#1B4332] border border-slate-200 font-black uppercase text-xs tracking-widest rounded-2xl flex items-center gap-3 hover:bg-slate-50 transition-all">
              <Layers className="w-5 h-5" /> Consolidation Console
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Mission Total', value: stats.total, icon: Package, color: 'text-[#1B4332]' },
           { label: 'Daily Velocity', value: stats.today, icon: TrendingUp, color: 'text-emerald-600' },
           { label: 'Awaiting Pack', value: stats.pending, icon: List, color: 'text-orange-600' },
           { label: 'Revenue Yield', value: `$${stats.revenue.toLocaleString()}`, icon: ShieldCheck, color: 'text-purple-600' }
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

      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 space-y-8 shadow-sm">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1A202C] uppercase tracking-tight">Recent Activity Log</h2>
            <button onClick={() => navigate('/cairo/shipments')} className="text-[10px] font-black text-[#1B4332] uppercase tracking-widest hover:underline">View Full Ledger</button>
         </div>
         <div className="space-y-4">
            {shipments.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#1B4332]/10 rounded-2xl flex items-center justify-center font-black text-[#1B4332] text-xs uppercase">
                       {s.destination.slice(0, 3)}
                    </div>
                    <div>
                       <p className="font-mono font-black text-[#1A202C] tracking-tighter">{s.trackingNumber}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{s.senderName} → {s.receiverName}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <StatusBadge status={s.status} size="sm" />
                    <button className="p-3 text-slate-300 hover:text-[#1B4332] transition-all">
                       <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function MyShipments() {
  const { shipments } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const isMine = s.createdBy === user?.id;
      return isMine && matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter, user]);

  const handleDuplicate = (s: Shipment) => {
    const { senderName, receiverName, itemDescription, weight, weightUnit, photoUrl, priorityLabels, totalAmount, paidAmount, balanceDue, destination, createdBy } = s; const rest = { senderName, receiverName, itemDescription, weight, weightUnit, photoUrl, priorityLabels, totalAmount, paidAmount, balanceDue, destination, createdBy };
    setEditingShipment({ ...rest, id: '', trackingNumber: '', createdAt: '', updatedAt: '', status: 'received' } as Shipment);
  };

  if (editingShipment) {
    return <CreateShipment initialData={editingShipment} onComplete={() => setEditingShipment(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-[#1A202C] uppercase">Operational <span className="text-[#1B4332]">Ledger</span></h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Direct management of registered parcels</p>
        </div>
        <div className="flex flex-1 w-full md:w-auto gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input placeholder="Scan or type ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-[#1A202C] focus:border-[#1B4332] outline-none transition-all shadow-sm" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | ShipmentStatus)} className="h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold text-xs text-slate-500 uppercase tracking-widest outline-none focus:border-[#1B4332] transition-all">
                <option value="all">ALL PROTOCOLS</option>
                <option value="received">RECEIVED</option>
                <option value="awaiting_flight">AWAITING PACK</option>
                <option value="shipped">TRANSIT</option>
                <option value="arrived">ARRIVED</option>
            </select>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                        <th className="px-10 py-6">ID Protocol</th>
                        <th className="px-10 py-6">Operational Details</th>
                        <th className="px-10 py-6">Financial Yield</th>
                        <th className="px-10 py-6">State</th>
                        <th className="px-10 py-6 text-right">Access</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredShipments.map(s => (
                        <tr key={s.id} className="hover:bg-slate-100/50 transition-all">
                            <td className="px-10 py-8 font-mono font-black text-[#1B4332] text-lg tracking-tighter">{s.trackingNumber}</td>
                            <td className="px-10 py-8">
                                <p className="font-black text-[#1A202C] leading-tight uppercase text-xs mb-1">{s.senderName} → {s.receiverName}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{s.itemDescription} • {s.weight}kg</p>
                            </td>
                            <td className="px-10 py-8">
                                <p className="text-sm font-black text-[#1A202C]">${s.totalAmount}</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.balanceDue > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                    {s.balanceDue > 0 ? `-$${s.balanceDue}` : 'Settled'}
                                </p>
                            </td>
                            <td className="px-10 py-8"><StatusBadge status={s.status} size="sm" /></td>
                            <td className="px-10 py-8 text-right">
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => handleDuplicate(s)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#1B4332] transition-all"><Copy className="w-4 h-4" /></button>
                                    {s.status === 'received' && (
                                        <button onClick={() => setEditingShipment(s)} className="p-3 bg-emerald-50 rounded-xl text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                    )}
                                    <button onClick={() => window.print()} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#1A202C] transition-all"><Printer className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredShipments.length === 0 && <div className="py-32 text-center text-slate-400 font-black uppercase tracking-widest">No active protocols detected</div>}
        </div>
      </div>
    </div>
  );
}

function ReturnShipments() {
  const { shipments } = useData();
  const returns = shipments.filter(s => s.status === 'returned');
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <h1 className="text-3xl font-black tracking-tight text-[#1A202C] uppercase">Return <span className="text-red-600">Protocol</span></h1>
        <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]"><th className="px-10 py-6">ID Protocol</th><th className="px-10 py-6">Receiver</th><th className="px-10 py-6">Refusal Intel</th><th className="px-10 py-6">State</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {returns.map(s => (
                        <tr key={s.id}>
                            <td className="px-10 py-8 font-mono font-black text-red-600 tracking-tighter">{s.trackingNumber}</td>
                            <td className="px-10 py-8 font-black text-[#1A202C] text-xs uppercase">{s.receiverName}</td>
                            <td className="px-10 py-8 text-xs font-bold text-slate-500 italic max-w-sm leading-relaxed">"{s.refusalReason || 'Protocol violation or manual refusal'}"</td>
                            <td className="px-10 py-8"><StatusBadge status={s.status} size="sm" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {returns.length === 0 && <div className="py-32 text-center text-slate-400 font-black uppercase tracking-widest">No return protocols active</div>}
        </div>
    </div>
  );
}

export default function CairoDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-8 md:p-12 overflow-auto min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/new" element={<CreateShipment />} />
            <Route path="/shipments" element={<MyShipments />} />
            <Route path="/sacks" element={<SackManager />} />
            <Route path="/search" element={<GlobalSearch />} />
            <Route path="/batches" element={<BatchManager />} />
            <Route path="/returns" element={<ReturnShipments />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
