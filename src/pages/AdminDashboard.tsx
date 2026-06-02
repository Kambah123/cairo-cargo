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
  LayoutDashboard, Package, Users, History, ChevronRight, Search,
  MoreVertical, Trash2, X, AlertTriangle, CheckCircle,
  ShieldAlert, Plus, Layers, DollarSign, ArrowUpRight, ArrowDownRight, Activity, CreditCard
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
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'New Shipment', icon: Plus, path: '/admin/new-shipment' },
    { label: 'All Shipments', icon: Package, path: '/admin/shipments' },
    { label: 'Sack Manager', icon: Layers, path: '/admin/sacks' },
    { label: 'Intel Search', icon: Search, path: '/admin/search' },
    { label: 'Weight Alerts', icon: ShieldAlert, path: '/admin/alerts', badge: pendingAlerts },
    { label: 'Staff Directory', icon: Users, path: '/admin/staff' },
    { label: 'Audit Trail', icon: History, path: '/admin/audit' },
  ];
  return (
    <aside className="hidden md:flex w-[280px] flex-col bg-[#0F172A] border-r border-white/5 h-[calc(100vh-56px)] sticky top-14">
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3"><item.icon className="w-4.5 h-4.5" />{item.label}</div>
            {(item.badge ?? 0) > 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
          <History className="w-4.5 h-4.5" /> Logout Session
        </button>
      </div>
    </aside>
  );
}

function StatCard({ label, value, icon: Icon, color, trend, trendValue }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendValue}%
                    </div>
                )}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        </div>
    );
}

function Overview() {
  const { shipments, weightAlerts, adminActions } = useData();
  const navigate = useNavigate();
  const pendingAlerts = weightAlerts.filter(a => a.status === 'pending').length;
  const inTransit = shipments.filter(s => ['shipped', 'departed', 'flight_booked'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'delivered').length;

  const chartData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 700 },
    { name: 'Wed', value: 450 },
    { name: 'Thu', value: 900 },
    { name: 'Fri', value: 650 },
    { name: 'Sat', value: 850 },
    { name: 'Sun', value: 1100 },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Operational Hub</h1>
            <p className="text-slate-400 font-bold">Real-time logistics intelligence & terminal control</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/admin/new-shipment')} className="h-14 px-6 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 text-xs">
                <Plus className="w-4 h-4" /> New Parcel
            </button>
            <button onClick={() => navigate('/admin/sacks')} className="h-14 px-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex items-center gap-2 text-xs">
                <Layers className="w-4 h-4" /> Build Sack
            </button>
            <button onClick={() => navigate('/admin/search')} className="h-14 px-6 border-2 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all flex items-center gap-2 text-xs">
                <Search className="w-4 h-4" /> Search
            </button>
            <button onClick={() => navigate('/admin/shipments')} className="h-14 px-6 bg-orange-100 text-orange-600 font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all flex items-center gap-2 text-xs">
                <CreditCard className="w-4 h-4" /> Payments
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Inventory" value={shipments.length} icon={Package} color="bg-blue-500" trend="up" trendValue="12" />
        <StatCard label="In Transit" value={inTransit} icon={Activity} color="bg-orange-500" trend="up" trendValue="5" />
        <StatCard label="Delivered" value={delivered} icon={CheckCircle} color="bg-green-500" trend="up" trendValue="24" />
        <StatCard label="Security Alerts" value={pendingAlerts} icon={ShieldAlert} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
           <div className="flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Dynamics</h3>
                 <p className="text-xs font-bold text-slate-400">Weekly financial performance audit</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Gross Yield</p>
                    <p className="text-xl font-black text-green-500">$48,250.00</p>
                 </div>
                 <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-2xl text-green-600">
                    <DollarSign className="w-6 h-6" />
                 </div>
              </div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#0F172A] p-8 rounded-[3rem] text-white shadow-2xl space-y-8 flex flex-col justify-between overflow-hidden relative">
           <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4">
              <Activity className="w-64 h-64" />
           </div>
           <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Activity Stream</h3>
              <p className="text-slate-400 text-xs font-bold mb-8">Real-time terminal event log</p>

              <div className="space-y-6">
                 {adminActions.slice(0, 5).map(log => (
                    <div key={log.id} className="flex gap-4 group">
                       <div className="relative flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-last:bg-green-500 group-last:shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                          <div className="w-0.5 h-full bg-white/10 group-last:hidden mt-2" />
                       </div>
                       <div className="pb-4">
                          <p className="text-xs font-black text-white/90 uppercase tracking-widest">{log.actionType.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-slate-400 font-bold mb-1">{log.adminName} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                          <p className="text-[10px] text-blue-400 font-mono font-bold truncate w-40">{log.shipmentId || log.batchId}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           <button onClick={() => navigate('/admin/audit')} className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 text-xs">
              View Full Audit <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}

function WeightAlerts() {
    const { weightAlerts, resolveWeightAlert } = useData();
    const { user } = useAuth();
    const [tab, setTab] = useState<'pending' | 'resolved' | 'ignored'>('pending');

    const filtered = weightAlerts.filter(a => a.status === tab);

    const handleAction = async (id: string, action: 'resolved' | 'ignored') => {
        const reason = window.prompt('Audit Reason for Decision:');
        if (reason) {
            try {
                await resolveWeightAlert(id, user!.id, action, reason);
                toast.success('Alert record updated');
            } catch { toast.error('Command failed'); }
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Security Oversight</h1>
                   <p className="text-slate-400 font-bold tracking-tight">Weight discrepancy detection & resolution terminal</p>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl flex gap-1">
                    {['pending', 'resolved', 'ignored'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                tab === t
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <th className="px-10 py-6">Tracking Protocol</th>
                                <th className="px-10 py-6">Origin Wt (Cairo)</th>
                                <th className="px-10 py-6">Final Wt (NG)</th>
                                <th className="px-10 py-6">Variance</th>
                                <th className="px-10 py-6 text-right">Protocol Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {filtered.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-10 py-8 font-mono font-black text-sm text-blue-600">
                                       <div className="flex gap-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Entry</span></div>
                                       {a.trackingNumber}
                                    </td>
                                    <td className="px-10 py-8 font-black text-slate-700 dark:text-slate-300">{a.initialWeight}kg</td>
                                    <td className="px-10 py-8 font-black text-slate-700 dark:text-slate-300">{a.finalWeight}kg</td>
                                    <td className="px-10 py-8">
                                       <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl font-black text-xs">
                                          -{a.discrepancy.toFixed(1)}kg ({((a.discrepancy/a.initialWeight)*100).toFixed(1)}%)
                                       </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        {tab === 'pending' ? (
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleAction(a.id, 'ignored')} className="h-12 px-6 border-2 border-slate-200 dark:border-white/10 text-slate-400 font-black uppercase text-[10px] rounded-xl hover:bg-slate-100 transition-all">Ignore</button>
                                                <button onClick={() => handleAction(a.id, 'resolved')} className="h-12 px-6 bg-blue-600 text-white font-black uppercase text-[10px] rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Resolve Case</button>
                                            </div>
                                        ) : (
                                           <div className="text-right">
                                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Final Decision Reason</p>
                                              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">"{a.reason}"</p>
                                           </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                       <div className="py-32 text-center space-y-4">
                          <CheckCircle className="w-16 h-16 text-green-500/20 mx-auto" />
                          <div>
                             <p className="text-xl font-black text-slate-300 uppercase tracking-tighter">No Breach Detected</p>
                             <p className="text-sm font-bold text-slate-400">All inventory weights within tolerance levels</p>
                          </div>
                       </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ShipmentDetailsModal({ shipment, onClose, onAction }: { shipment: Shipment, onClose: () => void, onAction: (type: string, data: any) => void }) {
  const [reason, setReason] = useState('');
  const [paidAmt, setPaidAmt] = useState(shipment.paidAmount.toString());

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0F172A]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
            <div>
                <h2 className="font-mono font-black text-3xl text-blue-600 tracking-tighter mb-1">{shipment.trackingNumber}</h2>
                <div className="flex gap-3"><DestinationBadge destination={shipment.destination} size="sm" /><StatusBadge status={shipment.status} size="sm" /></div>
            </div>
            <button onClick={onClose} className="p-4 bg-white dark:bg-white/5 rounded-2xl shadow-sm hover:scale-110 active:scale-90 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Terminal Status Override</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['received', 'shipped', 'arrived', 'delivered', 'on_hold', 'returned'].map(s => (
                        <button
                           key={s}
                           onClick={() => { if(reason) onAction('override_status', { status: s, reason }); else toast.error('Action Reason Mandatory'); }}
                           className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${
                              shipment.status === s
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                              : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-600/50'
                           }`}
                        >
                           {s.replace(/_/g, ' ')}
                        </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Financial Correction ($)</label>
                 <div className="flex gap-3">
                    <input type="number" value={paidAmt} onChange={e => setPaidAmt(e.target.value)} className="flex-1 h-14 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-600 rounded-2xl px-6 font-black text-xl outline-none transition-all" />
                    <button onClick={() => { if(reason) onAction('adjust_balance', { paidAmount: parseFloat(paidAmt), reason }); else toast.error('Action Reason Mandatory'); }} className="h-14 px-8 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all active:scale-95">Update</button>
                 </div>
              </div>
           </div>
           <div className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Audit Mandate (Required)</label>
                 <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide high-fidelity context for this terminal override..." className="w-full h-44 p-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-600 rounded-[2rem] text-sm font-bold outline-none transition-all resize-none" />
              </div>
              <button onClick={() => { if(window.confirm('PROTOCOL WARNING: This will permanently purge this record from existence. Continue?')) onAction('delete_shipment', { reason }); }} className="w-full h-16 bg-red-50 text-red-600 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/5 active:scale-95"><Trash2 className="w-5 h-5" /> Purge Shipment</button>
           </div>
        </div>
      </div>
    </div>
  );
}

function AllShipments() {
  const { shipments, logAdminAction, updateShipment, deleteShipment } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = shipments.filter((s) => s.trackingNumber.toLowerCase().includes(filter.toLowerCase()) || s.senderName.toLowerCase().includes(filter.toLowerCase()));

  const handleAdminAction = async (type: string, data: any) => {
    if (!selectedShipment || !user) return;
    try {
      if (type === 'override_status') {
        await logAdminAction({ adminId: user.id, adminName: user.name, shipmentId: selectedShipment.id, actionType: 'override_status', oldValue: selectedShipment.status, newValue: data.status, reason: data.reason });
        await updateShipment(selectedShipment.id, { status: data.status });
        toast.success('System override successful');
      } else if (type === 'adjust_balance') {
        const newBalance = selectedShipment.totalAmount - data.paidAmount;
        await logAdminAction({ adminId: user.id, adminName: user.name, shipmentId: selectedShipment.id, actionType: 'adjust_balance', oldValue: selectedShipment.paidAmount.toString(), newValue: data.paidAmount.toString(), reason: data.reason });
        await updateShipment(selectedShipment.id, { paidAmount: data.paidAmount, balanceDue: newBalance });
      } else if (type === 'delete_shipment') {
        await logAdminAction({ adminId: user.id, adminName: user.name, shipmentId: selectedShipment.id, actionType: 'delete_shipment', oldValue: 'exists', newValue: 'deleted', reason: data.reason });
        await deleteShipment(selectedShipment.id);
        toast.success('Inventory purged');
      }
      setSelectedShipment(null);
    } catch { toast.error('Terminal command rejected'); }
  };

  const handleBulkStatus = async () => {
    const status = window.prompt('Terminal Instruction: Enter target status for batch:');
    if (status && selectedIds.length > 0) {
        try {
            await Promise.all(selectedIds.map(id => updateShipment(id, { status: status as any })));
            toast.success(`Updated ${selectedIds.length} protocols`);
            setSelectedIds([]);
        } catch { toast.error('Bulk command failure'); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Inventory Control</h1>
             <p className="text-slate-400 font-bold tracking-tight">Active monitoring of all parcels within the ecosystem</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {selectedIds.length > 0 && (
                <button onClick={handleBulkStatus} className="h-14 px-6 bg-orange-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 flex items-center gap-2 animate-in zoom-in duration-300">
                   <CheckCircle className="w-5 h-5" /> Bulk Command ({selectedIds.length})
                </button>
            )}
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
               <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Tracking ID, sender, receiver..." className="w-full h-14 pl-14 pr-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl font-bold text-sm focus:border-blue-600 outline-none transition-all shadow-sm" />
            </div>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
           <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                   <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                       <th className="px-10 py-6"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(s => s.id) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} className="rounded-lg w-5 h-5 accent-blue-600" /></th>
                       <th className="px-10 py-6">Identity Protocol</th>
                       <th className="px-10 py-6">Operational Context</th>
                       <th className="px-10 py-6">Current Status</th>
                       <th className="px-10 py-6 text-right">Access</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                   {filtered.map((s) => (
                       <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                           <td className="px-10 py-8"><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} className="rounded-lg w-5 h-5 accent-blue-600" /></td>
                           <td className="px-10 py-8 font-mono font-black text-lg text-blue-600 tracking-tighter">{s.trackingNumber}</td>
                           <td className="px-10 py-8">
                              <p className="font-black text-slate-800 dark:text-slate-200 mb-1 leading-tight">{s.senderName} → {s.receiverName}</p>
                              <div className="flex flex-wrap gap-2 items-center">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.weight}kg • </span>
                                 <DestinationBadge destination={s.destination} size="sm" />
                                 <PriorityChips labels={s.priorityLabels} size="sm" />
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-3">
                                 <StatusBadge status={s.status} size="sm" />
                                 {s.weightAlert && <div className="w-8 h-8 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" /></div>}
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <button onClick={() => setSelectedShipment(s)} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all">
                                 <MoreVertical className="w-5 h-5" />
                              </button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
        </div>
        {filtered.length === 0 && <div className="py-32 text-center text-slate-400 font-bold uppercase tracking-widest">No active protocols found</div>}
      </div>
      {selectedShipment && <ShipmentDetailsModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} onAction={handleAdminAction} />}
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Immutable Audit Trail</h1>
             <p className="text-slate-400 font-bold tracking-tight">Full-spectrum transparency of system overrides & adjustments</p>
          </div>
          <div className="relative w-80">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
             <input placeholder="Search audit logs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-14 pl-14 pr-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl font-bold text-sm focus:border-blue-600 outline-none transition-all shadow-sm" />
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
           <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                   <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                       <th className="px-10 py-6">Admin Intelligence</th>
                       <th className="px-10 py-6">Event Protocol</th>
                       <th className="px-10 py-6">Target ID</th>
                       <th className="px-10 py-6">Delta Log</th>
                       <th className="px-10 py-6">Mandate Reason</th>
                       <th className="px-10 py-6 text-right">Timestamp</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                   {filtered.map(log => (
                       <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                           <td className="px-10 py-8 font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">{log.adminName}</td>
                           <td className="px-10 py-8">
                              <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                                 {log.actionType.replace(/_/g, ' ')}
                              </span>
                           </td>
                           <td className="px-10 py-8 font-mono font-black text-blue-600 tracking-tighter">{log.shipmentId || log.batchId || '-'}</td>
                           <td className="px-10 py-8">
                              <div className="space-y-1">
                                 <p className="text-[10px] text-slate-300 font-bold line-through truncate w-32">{log.oldValue}</p>
                                 <p className="text-[10px] font-black text-green-500 uppercase tracking-widest truncate w-32">{log.newValue}</p>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-slate-500 font-bold italic text-xs leading-relaxed max-w-xs">"{log.reason}"</td>
                           <td className="px-10 py-8 text-right">
                              <p className="text-xs font-black text-slate-900 dark:text-white uppercase mb-0.5">{new Date(log.timestamp).toLocaleDateString()}</p>
                              <p className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
        </div>
        {filtered.length === 0 && <div className="py-32 text-center text-slate-400 font-bold uppercase tracking-widest">No audit data captured</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
      <Navbar />
      <div className="flex pt-14">
        <Sidebar />
        <main className="flex-1 p-8 md:p-12 overflow-auto min-h-[calc(100vh-56px)]">
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
