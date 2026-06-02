import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import PriorityChips from '@/components/PriorityChips';
import StaffManagement from '@/pages/StaffManagement';
import CreateShipment from '@/components/CreateShipment';
import SackManager from '@/pages/SackManager';
import GlobalSearch from '@/pages/GlobalSearch';
import {
  Package, Users, History, ChevronRight, Search,
  MoreVertical, X, AlertTriangle, CheckCircle,
  ShieldAlert, Plus, Layers, ArrowUpRight, ArrowDownRight, Activity, TrendingUp, LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment } from '@/types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { weightAlerts } = useData();
  const pendingAlerts = weightAlerts.filter(a => a.status === 'pending').length;

  const items = [
    { label: 'Intelligence Hub', icon: TrendingUp, path: '/admin' },
    { label: 'Operational Ledger', icon: Package, path: '/admin/shipments' },
    { label: 'Consolidation Console', icon: Layers, path: '/admin/sacks' },
    { label: 'Master Intel', icon: Search, path: '/admin/search' },
    { label: 'Security Alerts', icon: ShieldAlert, path: '/admin/alerts', badge: pendingAlerts },
    { label: 'Staff Directory', icon: Users, path: '/admin/staff' },
    { label: 'Immutable Audit', icon: History, path: '/admin/audit' },
  ];
  return (
    <aside className="hidden md:flex w-[300px] flex-col bg-[#0B0F19] border-r border-white/5 h-[calc(100vh-64px)] sticky top-16">
      <nav className="flex-1 p-6 space-y-2">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex justify-between items-center px-6 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4"><item.icon className="w-5 h-5" />{item.label}</div>
            {(item.badge ?? 0) > 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full animate-pulse">{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-white/5">
        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut className="w-5 h-5" /> Secure Exit
        </button>
      </div>
    </aside>
  );
}

function StatCard({ label, value, icon: Icon, color, trend, trendValue }: any) {
    return (
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-sm hover:shadow-2xl hover:bg-white/[0.07] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-5 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendValue}%
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
        </div>
    );
}

function Overview() {
  const { shipments, weightAlerts } = useData();
  const navigate = useNavigate();
  const pendingAlerts = weightAlerts.filter(a => a.status === 'pending').length;
  const inTransit = shipments.filter(s => ['shipped', 'departed', 'flight_booked'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'delivered').length;

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Intelligence <span className="text-blue-500">Hub</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Real-time logistics analytics & terminal control</p>
        </div>
        <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/admin/new-shipment')} className="h-14 px-8 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-3 text-xs">
                <Plus className="w-5 h-5" /> Register Parcel
            </button>
            <button onClick={() => navigate('/admin/sacks')} className="h-14 px-8 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 active:scale-95 transition-all flex items-center gap-3 text-xs hover:bg-white/10">
                <Layers className="w-5 h-5" /> Consolidation
            </button>
            <button onClick={() => navigate('/admin/search')} className="h-14 px-8 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 active:scale-95 transition-all flex items-center gap-3 text-xs hover:bg-white/10">
                <Search className="w-5 h-5" /> Master Search
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Network Inventory" value={shipments.length} icon={Package} color="bg-blue-600" trend="up" trendValue="12" />
        <StatCard label="Global Velocity" value={inTransit} icon={Activity} color="bg-purple-600" trend="up" trendValue="5" />
        <StatCard label="Handover Total" value={delivered} icon={CheckCircle} color="bg-emerald-600" trend="up" trendValue="24" />
        <StatCard label="Security Breach" value={pendingAlerts} icon={ShieldAlert} color="bg-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
           <div className="flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Flow Yield</h3>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">7-Day Transactional Intelligence</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-full" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Growth Factor</span>
              </div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[
                   { name: '01', val: 400 }, { name: '02', val: 700 }, { name: '03', val: 450 },
                   { name: '04', val: 900 }, { name: '05', val: 650 }, { name: '06', val: 850 }, { name: '07', val: 1100 }
                 ]}>
                    <defs>
                       <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #ffffff10', borderRadius: '1rem', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Logs</h3>
              <Activity className="w-5 h-5 text-blue-500" />
           </div>
           <div className="space-y-6">
              {shipments.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-[10px] text-blue-500 uppercase border border-white/5">
                      {s.destination.slice(0,3)}
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black text-white uppercase tracking-tighter">{s.trackingNumber}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{s.status.replace(/_/g, ' ')}</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </div>
              ))}
           </div>
           <button onClick={() => navigate('/admin/shipments')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-2xl transition-all">
              Launch Full Protocol
           </button>
        </div>
      </div>
    </div>
  );
}

function AllShipments() {
  const { shipments, updateShipment, deleteShipment } = useData();
  const [filter, setFilter] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = shipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(filter.toLowerCase()) ||
    s.senderName.toLowerCase().includes(filter.toLowerCase()) ||
    s.receiverName.toLowerCase().includes(filter.toLowerCase())
  );

  const handleBulkStatus = () => {
    const reason = prompt("Enter mandate reason for bulk update:");
    if (!reason) return;
    const newStatus = prompt("Enter new status protocol:");
    if (!newStatus) return;
    selectedIds.forEach(id => updateShipment(id, { status: newStatus as any }));
    toast.success("Bulk protocol update successful");
    setSelectedIds([]);
  };

  const handleAdminAction = async (id: string, action: string, data: any) => {
     if (action === 'delete') {
        if (confirm("Execute permanent deletion?")) {
           await deleteShipment(id);
           toast.success("Protocol terminated");
        }
     } else {
        await updateShipment(id, data);
        toast.success("Intelligence updated");
     }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-4xl font-black tracking-tight text-white uppercase">Operational <span className="text-blue-500">Ledger</span></h1>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Master control of all network parcel protocols</p>
          </div>
          <div className="flex flex-1 w-full md:w-auto gap-4 justify-end">
            {selectedIds.length > 0 && (
                <button onClick={handleBulkStatus} className="h-14 px-8 bg-orange-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-orange-600/20 flex items-center gap-3 animate-in zoom-in duration-300">
                   <CheckCircle className="w-5 h-5" /> Bulk Command ({selectedIds.length})
                </button>
            )}
            <div className="relative flex-1 md:w-96">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Tracking ID, sender, receiver..." className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm text-white focus:border-blue-600 outline-none transition-all shadow-sm" />
            </div>
          </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left">
               <thead className="bg-white/5 border-b border-white/5">
                   <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                       <th className="px-10 py-6"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(s => s.id) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} className="rounded-lg w-5 h-5 accent-blue-600 bg-white/5 border-white/10" /></th>
                       <th className="px-10 py-6">Identity Protocol</th>
                       <th className="px-10 py-6">Context</th>
                       <th className="px-10 py-6">State</th>
                       <th className="px-10 py-6 text-right">Access</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                   {filtered.map((s) => (
                       <tr key={s.id} className="hover:bg-white/[0.03] transition-all group">
                           <td className="px-10 py-8"><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} className="rounded-lg w-5 h-5 accent-blue-600 bg-white/5 border-white/10" /></td>
                           <td className="px-10 py-8 font-mono font-black text-lg text-blue-500 tracking-tighter">{s.trackingNumber}</td>
                           <td className="px-10 py-8">
                              <p className="font-black text-white mb-1 leading-tight uppercase text-xs">{s.senderName} → {s.receiverName}</p>
                              <div className="flex flex-wrap gap-2 items-center">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.weight}kg • </span>
                                 <DestinationBadge destination={s.destination} size="sm" />
                                 <PriorityChips labels={s.priorityLabels} size="sm" />
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-3">
                                 <StatusBadge status={s.status} size="sm" />
                                 {s.weightAlert && <div className="w-8 h-8 bg-red-600/10 rounded-xl flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" /></div>}
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <button onClick={() => setSelectedShipment(s)} className="p-4 bg-white/5 rounded-2xl text-slate-500 group-hover:text-white group-hover:bg-white/10 transition-all">
                                 <MoreVertical className="w-5 h-5" />
                              </button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
        </div>
        {filtered.length === 0 && <div className="py-32 text-center text-slate-500 font-black uppercase tracking-widest">No active protocols found</div>}
      </div>
      {selectedShipment && <ShipmentDetailsModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} onAction={handleAdminAction} />}
    </div>
  );
}

function WeightAlerts() {
    const { weightAlerts, resolveWeightAlert } = useData();
    const pending = weightAlerts.filter(a => a.status === 'pending');

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div>
               <h1 className="text-4xl font-black tracking-tight text-white uppercase">Security <span className="text-red-600">Alerts</span></h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Automated discrepancy detection & protocol verification</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
               {pending.map(alert => (
                 <div key={alert.id} className="bg-white/5 border border-red-600/20 rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 hover:bg-red-600/[0.03] transition-all">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                       <div className="flex items-center justify-center md:justify-start gap-4">
                          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                             <ShieldAlert className="w-6 h-6 text-white" />
                          </div>
                          <p className="font-mono font-black text-2xl text-white tracking-tighter uppercase">{alert.trackingNumber}</p>
                       </div>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Origin: {alert.initialWeight}kg • Destination: {alert.finalWeight}kg • <span className="text-red-500">Delta: {(alert.finalWeight - alert.initialWeight).toFixed(2)}kg</span></p>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => resolveWeightAlert(alert.id, 'admin', 'resolved')} className="h-16 px-10 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Authorize</button>
                       <button className="h-16 px-10 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-white/10 transition-all">Investigate</button>
                    </div>
                 </div>
               ))}
               {pending.length === 0 && <div className="py-32 text-center text-slate-500 font-black uppercase tracking-widest border-4 border-dashed border-white/5 rounded-[4rem]">Network integrity secured • No alerts</div>}
            </div>
        </div>
    );
}

function AuditLogs() {
  const { adminActions } = useData();
  const [search, setSearch] = useState('');

  const filtered = adminActions.filter(a =>
    a.adminName.toLowerCase().includes(search.toLowerCase()) ||
    a.actionType.toLowerCase().includes(search.toLowerCase()) ||
    a.shipmentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex justify-between items-center">
          <div>
             <h1 className="text-4xl font-black tracking-tight text-white uppercase">Immutable <span className="text-blue-500">Audit</span></h1>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Full-spectrum transparency of system overrides & adjustments</p>
          </div>
          <div className="relative w-96">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
             <input placeholder="Search audit logs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm text-white focus:border-blue-600 outline-none transition-all shadow-sm" />
          </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left">
               <thead className="bg-white/5 border-b border-white/5">
                   <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                       <th className="px-10 py-6">Intelligence Agent</th>
                       <th className="px-10 py-6">Protocol Event</th>
                       <th className="px-10 py-6">Target ID</th>
                       <th className="px-10 py-6">Delta Log</th>
                       <th className="px-10 py-6">Mandate Reason</th>
                       <th className="px-10 py-6 text-right">Time-Stamp</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-sm">
                   {filtered.map(log => (
                       <tr key={log.id} className="hover:bg-white/[0.03] transition-all">
                           <td className="px-10 py-8 font-black text-white uppercase tracking-tighter">{log.adminName}</td>
                           <td className="px-10 py-8">
                              <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-500">
                                 {log.actionType.replace(/_/g, ' ')}
                              </span>
                           </td>
                           <td className="px-10 py-8 font-mono font-black text-blue-500 tracking-tighter">{log.shipmentId || log.batchId || '-'}</td>
                           <td className="px-10 py-8">
                              <div className="space-y-2">
                                 <p className="text-[10px] text-slate-500 font-bold line-through truncate w-32">{log.oldValue}</p>
                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest truncate w-32">{log.newValue}</p>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-slate-400 font-bold italic text-xs leading-relaxed max-w-xs">"{log.reason}"</td>
                           <td className="px-10 py-8 text-right">
                              <p className="text-xs font-black text-white uppercase mb-1">{new Date(log.timestamp).toLocaleDateString()}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{new Date(log.timestamp).toLocaleTimeString()}</p>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
        </div>
        {filtered.length === 0 && <div className="py-32 text-center text-slate-500 font-black uppercase tracking-widest">No audit data captured</div>}
      </div>
    </div>
  );
}

function ShipmentDetailsModal({ shipment, onClose, onAction }: { shipment: Shipment, onClose: () => void, onAction: (id: string, action: string, data: any) => void }) {
    const [reason, setReason] = useState('');
    const [editData, setEditData] = useState(shipment);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return toast.error("Action mandate required");
        onAction(shipment.id, 'update', { ...editData, lastActionReason: reason });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#0B0F19]/95 backdrop-blur-2xl flex items-center justify-center p-6">
            <div className="bg-[#161B22] w-full max-w-2xl rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Protocol View</h2>
                            <p className="text-blue-500 font-mono font-black text-sm uppercase tracking-[0.2em]">{shipment.trackingNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-12 space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Current State</label>
                           <select
                            value={editData.status}
                            onChange={e => setEditData({ ...editData, status: e.target.value as any })}
                            className="w-full h-16 bg-white/5 border border-white/5 rounded-3xl px-8 font-black text-white text-xs uppercase tracking-widest outline-none focus:border-blue-600 transition-all"
                           >
                               {['received', 'awaiting_flight', 'ready_for_flight', 'flight_booked', 'departed', 'shipped', 'arrived', 'ready_for_pickup', 'delivered', 'on_hold', 'returned'].map(s => (
                                   <option key={s} value={s}>{s.toUpperCase()}</option>
                               ))}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Mass Verification (kg)</label>
                           <input
                            type="number"
                            step="0.01"
                            value={editData.weight}
                            onChange={e => setEditData({ ...editData, weight: Number(e.target.value) })}
                            className="w-full h-16 bg-white/5 border border-white/5 rounded-3xl px-8 font-black text-white text-lg outline-none focus:border-blue-600 transition-all"
                           />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">Action Mandate / Reason</label>
                        <textarea
                            required
                            placeholder="State reason for operational override..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full h-32 bg-white/5 border border-white/5 rounded-[2rem] p-8 font-bold text-white text-sm outline-none focus:border-blue-600 transition-all resize-none"
                        />
                    </div>
                    <div className="flex gap-6 pt-6">
                        <button type="button" onClick={() => onAction(shipment.id, 'delete', {})} className="px-10 h-16 bg-red-600/10 text-red-500 font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-red-600 hover:text-white transition-all active:scale-95">Terminate</button>
                        <button type="submit" className="flex-1 h-16 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">Execute Command</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-8 md:p-12 overflow-auto min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/new-shipment" element={<CreateShipment />} />
            <Route path="/shipments" element={<AllShipments />} />
            <Route path="/sacks" element={<SackManager />} />
            <Route path="/search" element={<GlobalSearch />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/alerts" element={<WeightAlerts />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
