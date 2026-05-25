import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import StaffManagement from '@/pages/StaffManagement';
import {
  LayoutDashboard, Package, TrendingUp, Users, History, ChevronRight, Search,
  MoreVertical, Edit, Trash2, X, AlertTriangle, CheckCircle, Download,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { weightAlerts } = useData();
  const pendingAlerts = weightAlerts.filter(a => a.status === 'pending').length;

  const items = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'All Shipments', icon: Package, path: '/admin/shipments' },

    { label: 'Weight Alerts', icon: ShieldAlert, path: '/admin/alerts', badge: pendingAlerts },
    { label: 'Staff Management', icon: Users, path: '/admin/staff' },
    { label: 'Audit Logs', icon: History, path: '/admin/audit' },
  ];
  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-white border-r h-[calc(100vh-56px)] sticky top-14">
      <nav className="flex-1 p-3 space-y-1">{items.map((item) => (
        <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium ${location.pathname === item.path ? 'bg-[#EDF2F7] text-[#1B4332] border-l-[3px] border-[#1B4332]' : 'text-[#4A5568]'}`}>
            <div className="flex items-center gap-3"><item.icon className="w-4 h-4" />{item.label}</div>
            {(item.badge ?? 0) > 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{item.badge}</span>}
        </button>
      ))}</nav>
      <div className="p-3 border-t"><button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E53E3E]"><History className="w-4 h-4" /> Logout</button></div>
    </aside>
  );
}

function Overview() {
  const { shipments, weightAlerts } = useData();
  const pendingAlerts = weightAlerts.filter(a => a.status === 'pending').length;

  const stats = [
    { label: 'Total Shipments', value: shipments.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Weight Alerts', value: pendingAlerts, icon: ShieldAlert, color: 'bg-red-500' },
    { label: 'Active Batches', value: 0, icon: TrendingUp, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{stats.map((s, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${s.color} text-white`}><s.icon className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-gray-500">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
        </div>
      ))}</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border shadow-sm h-[400px]">
          <h3 className="font-bold mb-6 flex items-center justify-between">Recent Activity <ChevronRight className="w-4 h-4" /></h3>
          <div className="space-y-4">{shipments.slice(0, 6).map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#1B4332]" /><div><p className="text-sm font-bold">{s.trackingNumber}</p><p className="text-[10px] uppercase text-gray-400">{s.status.replace(/_/g, ' ')}</p></div></div>
              <span className="text-[10px] text-gray-400 font-medium">{new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
          ))}</div>
        </div>
        <div className="bg-[#1B4332] p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
            <div><h3 className="text-xl font-bold mb-2">Revenue Growth</h3><p className="text-white/60 text-sm">Monthly performance overview</p></div>
            <div className="h-48 flex items-end gap-2 px-4">
                {[40, 70, 45, 90, 65, 85].map((h, i) => <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-white/20 rounded-t-lg hover:bg-white/40 transition-all cursor-help" title={`${h*1000} USD`} />)}
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <div><p className="text-white/40 text-[10px] font-bold uppercase">Total Revenue</p><p className="text-2xl font-bold">$14,250</p></div>

            </div>
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
        const reason = window.prompt('Reason for decision:');
        if (reason) {
            try {
                await resolveWeightAlert(id, user!.id, action, reason);
                toast.success('Alert resolved');
            } catch { toast.error('Failed'); }
        }
    };

    return (
        <div className="max-w-6xl space-y-6">
            <h1 className="text-2xl font-bold">Weight Discrepancy Resolution</h1>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {(['pending', 'resolved', 'ignored'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all ${tab === t ? 'bg-white shadow-sm text-[#1B4332]' : 'text-gray-400 hover:text-gray-600'}`}>{t}</button>
                ))}
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-[10px] font-bold uppercase text-gray-400">
                            <th className="px-6 py-4">Tracking #</th>
                            <th className="px-6 py-4">Weights (Initial / Final)</th>
                            <th className="px-6 py-4">Discrepancy</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.map(a => (
                            <tr key={a.id} className="text-sm">
                                <td className="px-6 py-4 font-mono font-bold text-[#1B4332]">{a.trackingNumber}</td>
                                <td className="px-6 py-4 font-medium">{a.initialWeight}kg / {a.finalWeight}kg</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg font-bold">-{a.discrepancy.toFixed(1)}kg ({((a.discrepancy/a.initialWeight)*100).toFixed(1)}%)</span></td>
                                <td className="px-6 py-4"><span className={`capitalize font-bold text-xs ${tab === 'pending' ? 'text-orange-500' : tab === 'resolved' ? 'text-green-500' : 'text-gray-400'}`}>{a.status}</span></td>
                                <td className="px-6 py-4 text-right">
                                    {tab === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleAction(a.id, 'ignored')} className="px-3 py-1.5 bg-gray-100 rounded-lg font-bold text-[10px] hover:bg-gray-200">Ignore</button>
                                            <button onClick={() => handleAction(a.id, 'resolved')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-[10px] hover:bg-green-700 shadow-sm">Accept Final</button>
                                        </div>
                                    )}
                                    {tab !== 'pending' && <p className="text-[10px] text-gray-400 italic">"{a.reason}"</p>}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No alerts in this category</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ShipmentDetailsModal({ shipment, onClose, onAction }: {
  shipment: Shipment; onClose: () => void; onAction: (type: string, data: any) => void;
}) {
  const [status, setStatus] = useState(shipment.status);
  const [paid, setPaid] = useState(shipment.paidAmount.toString());
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border">
        <div className="p-6 border-b flex justify-between items-center bg-[#1B4332] text-white">
            <div><h3 className="text-xl font-bold">Administrative Controls</h3><p className="text-white/60 text-xs font-mono">{shipment.trackingNumber}</p></div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Override Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-11 border-2 rounded-xl px-3 text-sm focus:border-[#1B4332] outline-none">
                      <option value="received">Received</option>
                      <option value="awaiting_flight">Awaiting Flight</option>
                      <option value="ready_for_flight">Ready for Flight</option>
                      <option value="flight_booked">Flight Booked</option>
                      <option value="departed">Departed</option>
                      <option value="shipped">Shipped</option>
                      <option value="arrived">Arrived</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="delivered">Delivered</option>
                      <option value="on_hold">On Hold</option>
                      <option value="returned">Returned</option>
                  </select>
                 <button onClick={() => onAction('override_status', { status, reason })} disabled={status === shipment.status || !reason} className="w-full h-12 bg-gray-100 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-gray-200 transition-colors">Apply Override</button>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Adjust Balance (Paid Amount)</label>
                  <div className="flex gap-2">
                      <input type="number" value={paid} onChange={e => setPaid(e.target.value)} className="w-full h-11 border-2 rounded-xl px-3 text-sm focus:border-[#1B4332] outline-none" />
                      <button onClick={() => onAction('adjust_balance', { paidAmount: parseFloat(paid), reason })} disabled={parseFloat(paid) === shipment.paidAmount || !reason} className="h-11 px-6 bg-gray-100 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-gray-200">Save</button>
                  </div>
              </div>
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-red-500 uppercase">Audit Reason (Required)</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={4} placeholder="Why is this change being made?" className="w-full p-4 text-sm border-2 border-red-50 rounded-2xl resize-none bg-red-50/30 focus:border-red-200 outline-none" />
              </div>
              <div className="pt-4 space-y-3">
                  <button onClick={() => onAction('edit_details', { reason })} className="w-full h-12 border-2 text-gray-600 text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"><Edit className="w-4 h-4" /> Edit Core Details</button>
                  <button onClick={() => { if(window.confirm('IRREVERSIBLE: Delete this shipment?')) onAction('delete_shipment', { reason }); }} className="w-full h-12 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /> Permanent Delete</button>
              </div>
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
        toast.success('Override successful');
      } else if (type === 'adjust_balance') {
        const newBalance = selectedShipment.totalAmount - data.paidAmount;
        await logAdminAction({ adminId: user.id, adminName: user.name, shipmentId: selectedShipment.id, actionType: 'adjust_balance', oldValue: selectedShipment.paidAmount.toString(), newValue: data.paidAmount.toString(), reason: data.reason });
        await updateShipment(selectedShipment.id, { paidAmount: data.paidAmount, balanceDue: newBalance });
        toast.success('Adjustment applied');
      } else if (type === 'delete_shipment') {
        await logAdminAction({ adminId: user.id, adminName: user.name, shipmentId: selectedShipment.id, actionType: 'delete_shipment', oldValue: 'exists', newValue: 'deleted', reason: data.reason });
        await deleteShipment(selectedShipment.id);
        toast.success('Deleted permanently');
      }
      setSelectedShipment(null);
    } catch { toast.error('Action failed'); }
  };

  const handleBulkStatus = async () => {
    const status = window.prompt('Enter status for all selected (e.g. shipped):');
    if (status && selectedIds.length > 0) {
        try {
            await Promise.all(selectedIds.map(id => updateShipment(id, { status: status as any })));
            toast.success(`Updated ${selectedIds.length} shipments`);
            setSelectedIds([]);
        } catch { toast.error('Bulk update failed'); }
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold">Inventory Control</h1><p className="text-xs text-gray-400">Management of all parcels in system</p></div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <button onClick={handleBulkStatus} className="h-10 px-4 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 animate-in zoom-in duration-200"><CheckCircle className="w-4 h-4" /> Bulk Status (${selectedIds.length})</button>
            )}
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" /><input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Tracking, sender, receiver..." className="h-10 pl-9 pr-4 border rounded-xl w-72 bg-white" /></div>
          </div>
      </div>

      <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] border-b">
                <tr className="text-[10px] font-bold uppercase text-gray-400">
                    <th className="px-6 py-4"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(s => s.id) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} className="rounded" /></th>
                    <th className="px-6 py-4">Tracking ID</th>
                    <th className="px-6 py-4">Context</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} className="rounded" /></td>
                        <td className="px-6 py-4 font-mono font-bold text-sm">{s.trackingNumber}</td>
                        <td className="px-6 py-4 text-sm"><p className="font-medium text-gray-700">{s.senderName} → {s.receiverName}</p><p className="text-[10px] text-gray-400 font-bold">{s.weight}kg • {s.destination.toUpperCase()}</p></td>
                        <td className="px-6 py-4"><div className="flex items-center gap-2"><StatusBadge status={s.status} size="sm" />{s.weightAlert && <AlertTriangle className="w-4 h-4 text-[#E53E3E] animate-pulse" />}</div></td>
                        <td className="px-6 py-4 text-right"><button onClick={() => setSelectedShipment(s)} className="p-2 hover:bg-[#EDF2F7] rounded-xl text-gray-400 group-hover:text-[#1B4332]"><MoreVertical className="w-4 h-4" /></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filtered.length === 0 && <div className="py-20 text-center text-gray-400">No shipments match your criteria</div>}
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
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Immutable Audit Trail</h1>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 pl-9 pr-4 border rounded-xl w-64 bg-white" /></div>
      </div>
      <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] border-b">
                <tr className="text-[10px] font-bold uppercase text-gray-400">
                    <th className="px-6 py-4">Admin Name</th>
                    <th className="px-6 py-4">Action Event</th>
                    <th className="px-6 py-4">Target ID</th>
                    <th className="px-6 py-4">Change Log</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Timestamp</th>
                </tr>
            </thead>
            <tbody className="divide-y text-sm">
                {filtered.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800">{log.adminName}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold uppercase">{log.actionType.replace(/_/g, ' ')}</span></td>
                        <td className="px-6 py-4 font-mono font-bold text-[#1B4332]">{log.shipmentId || log.batchId || '-'}</td>
                        <td className="px-6 py-4"><p className="text-[10px] text-gray-400 line-through truncate w-24">{log.oldValue}</p><p className="text-[10px] font-bold text-green-600 truncate w-24">{log.newValue}</p></td>
                        <td className="px-6 py-4 text-[#4A5568] italic">"{log.reason}"</td>
                        <td className="px-6 py-4 text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filtered.length === 0 && <div className="py-20 text-center text-gray-400">No logs found</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <div className="flex pt-14">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/shipments" element={<AllShipments />} />

            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/alerts" element={<WeightAlerts />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
