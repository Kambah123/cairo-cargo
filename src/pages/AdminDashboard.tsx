import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import StaffManagement from '@/pages/StaffManagement';
import {
  LayoutDashboard, Package, CreditCard, LogOut, Search,
  TrendingUp, Activity, CheckCircle, AlertTriangle,
  Users, History, X, ShieldAlert, ChevronRight, DollarSign, Edit, Trash2, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const items = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'All Shipments', icon: Package, path: '/admin/shipments' },
    { label: 'Financials', icon: CreditCard, path: '/admin/financials' },
    { label: 'Staff Management', icon: Users, path: '/admin/staff' },
    { label: 'Audit Logs', icon: History, path: '/admin/audit' },
  ];

  return (
    <aside className="hidden md:flex w-[280px] flex-col bg-white border-r border-[#E2E8F0] h-[calc(100vh-56px)] sticky top-14">
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-[#EDF2F7] text-[#1B4332] border-l-[3px] border-[#1B4332]' : 'text-[#4A5568]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E53E3E]"><LogOut className="w-4 h-4" /> Logout</button>
      </div>
    </aside>
  );
}

function Overview() {
  const { shipments, batches, weightAlerts, resolveWeightAlert } = useData();
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const todayShipments = shipments.filter((s) => s.createdAt.startsWith(today));
  const todayRevenue = todayShipments.reduce((sum, s) => sum + s.paidAmount, 0);
  const activeBatches = batches.filter((b) => b.status === 'open').length;
  const pendingAlerts = weightAlerts.filter(a => a.status === 'pending');

  const stats = [
    { label: "Today's Shipments", value: todayShipments.length, icon: Package, trend: '+12%', trendUp: true, color: '#1B4332' },
    { label: "Today's Revenue", value: `$${todayRevenue.toFixed(0)}`, icon: DollarSign, trend: '+8%', trendUp: true, color: '#38A169' },
    { label: 'Active Batches', value: activeBatches, icon: Activity, trend: 'Open', trendUp: true, color: '#3182CE' },
    { label: 'Weight Alerts', value: pendingAlerts.length, icon: AlertTriangle, trend: 'Action needed', trendUp: false, color: '#DD6B20' },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <h1 className="text-[28px] font-bold text-[#1A202C]">System Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trendUp ? 'bg-[#C6F6D5] text-[#2F855A]' : 'bg-[#FED7D7] text-[#C53030]'}`}>{stat.trend}</span>
            </div>
            <p className="text-2xl font-bold text-[#1A202C] mb-1">{stat.value}</p>
            <p className="text-xs font-medium text-[#A0AEC0] uppercase">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[#E53E3E]" /> Pending Alerts</h3></div>
          <div className="divide-y">
            {pendingAlerts.length > 0 ? pendingAlerts.map(alert => (
              <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-[#F8F9FA]">
                <div><p className="text-sm font-mono font-bold">{alert.trackingNumber}</p><p className="text-xs text-[#718096]">Diff: {alert.discrepancy.toFixed(1)}kg</p></div>
                <button onClick={() => user && resolveWeightAlert(alert.id, user.id)} className="h-8 px-3 border rounded-lg text-xs font-bold hover:bg-[#1B4332] hover:text-white transition-all">Resolve</button>
              </div>
            )) : <div className="p-12 text-center text-[#A0AEC0]"><CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-20" /><p className="text-sm">No pending alerts</p></div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-6"><h3 className="font-bold mb-6">Recent Activity</h3><div className="space-y-4">{shipments.slice(0, 6).map(s => (
          <div key={s.id} className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#1B4332]" /><div><p className="text-sm font-bold">{s.trackingNumber}</p><p className="text-[10px] uppercase">{s.status}</p></div></div><ChevronRight className="w-4 h-4 text-[#E2E8F0]" /></div>
        ))}</div></div>
      </div>
    </div>
  );
}

function ShipmentDetailsModal({ shipment, onClose, onAction }: {
  shipment: Shipment; onClose: () => void; onAction: (type: 'override_status' | 'adjust_balance', data: any) => void;
}) {
  const [status, setStatus] = useState(shipment.status);
  const [paid, setPaid] = useState(shipment.paidAmount.toString());
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-[#1B4332] text-white"><div><h3 className="text-xl font-bold">Admin Controls</h3><p className="text-white/60 text-xs font-mono">{shipment.trackingNumber}</p></div><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-bold text-[#A0AEC0] uppercase">Override Status</label><select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-11 border rounded-xl px-3 text-sm"><option value="received">Received</option><option value="awaiting_flight">Awaiting Flight</option><option value="shipped">Shipped</option><option value="arrived">Arrived</option><option value="ready_for_pickup">Ready for Pickup</option><option value="delivered">Delivered</option><option value="on_hold">On Hold</option></select>
                 <button onClick={() => onAction('override_status', { status, reason })} disabled={status === shipment.status || !reason} className="w-full h-10 bg-[#EDF2F7] rounded-lg text-xs font-bold disabled:opacity-50">Apply Override</button>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-[#A0AEC0] uppercase">Financial Adjustment</label><div className="flex gap-2"><input type="number" value={paid} onChange={e => setPaid(e.target.value)} className="w-full h-11 border rounded-xl px-3 text-sm" /><button onClick={() => onAction('adjust_balance', { paidAmount: parseFloat(paid), reason })} disabled={parseFloat(paid) === shipment.paidAmount || !reason} className="h-11 px-4 bg-[#EDF2F7] rounded-xl text-xs font-bold disabled:opacity-50">Save</button></div></div>
           </div>
           <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-bold text-red-500 uppercase">Reason (Required)</label><textarea value={reason} onChange={e => setReason(e.target.value)} required rows={4} className="w-full p-4 text-sm border-2 border-red-50 rounded-xl resize-none bg-red-50/30" /></div>
              <div className="pt-4 space-y-3"><button className="w-full h-12 border text-[#4A5568] text-sm font-bold rounded-xl flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Edit Details</button><button className="w-full h-12 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /> Cancel Shipment</button></div>
           </div>
        </div>
      </div>
    </div>
  );
}

function AllShipments() {
  const { shipments, logAdminAction, updateShipment } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
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
      }
      setSelectedShipment(null);
    } catch { toast.error('Failed'); }
  };
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold">All Shipments</h1></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" /><input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search..." className="h-10 pl-9 pr-4 border rounded-lg w-64" /></div></div>
      <div className="bg-white border rounded-2xl overflow-hidden"><table className="w-full text-left"><thead className="bg-[#F8F9FA] border-b"><tr><th className="px-6 py-4">Tracking ID</th><th className="px-6 py-4">Details</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
        <tbody className="divide-y">{filtered.map((s) => (
          <tr key={s.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
            <td className="px-6 py-4 font-mono font-bold">{s.trackingNumber}</td>
            <td className="px-6 py-4 text-sm"><p className="font-medium">{s.senderName} → {s.receiverName}</p><p className="text-xs text-[#718096]">{s.weight}kg • {s.destination.toUpperCase()}</p></td>
            <td className="px-6 py-4"><div className="flex items-center gap-2"><StatusBadge status={s.status} size="sm" />{s.weightAlert && <AlertTriangle className="w-4 h-4 text-[#E53E3E]" />}</div></td>
            <td className="px-6 py-4 text-right"><button onClick={() => setSelectedShipment(s)} className="p-2 hover:bg-[#EDF2F7] rounded-lg"><MoreVertical className="w-4 h-4" /></button></td>
          </tr>
        ))}</tbody></table></div>
      {selectedShipment && <ShipmentDetailsModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} onAction={handleAdminAction} />}
    </div>
  );
}

function Financials() {
  const { shipments } = useData();
  const totalRev = shipments.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPaid = shipments.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalDue = shipments.reduce((sum, s) => sum + s.balanceDue, 0);
  return (
    <div className="max-w-6xl space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="bg-[#1B4332] p-8 rounded-3xl text-white"><p className="text-white/60 text-xs font-bold uppercase mb-2">Total Revenue</p><p className="text-4xl font-bold">${totalRev.toLocaleString()}</p><div className="mt-6 flex items-center gap-2 text-white/80 text-sm"><TrendingUp className="w-4 h-4" /><span>Gross earnings</span></div></div>
         <div className="bg-white p-8 rounded-3xl border"><p className="text-[#A0AEC0] text-xs font-bold uppercase mb-2">Total Collected</p><p className="text-4xl font-bold text-[#38A169]">${totalPaid.toLocaleString()}</p></div>
         <div className="bg-white p-8 rounded-3xl border"><p className="text-[#A0AEC0] text-xs font-bold uppercase mb-2">Debt</p><p className="text-4xl font-bold text-[#E53E3E]">${totalDue.toLocaleString()}</p></div>
      </div>
    </div>
  );
}

function AuditLogs() {
  const { adminActions } = useData();
  return (
    <div className="max-w-6xl space-y-6">
      <div className="bg-white border rounded-2xl overflow-hidden"><table className="w-full text-left"><thead className="bg-[#F8F9FA] border-b"><tr><th className="px-6 py-4">Admin</th><th className="px-6 py-4">Action</th><th className="px-6 py-4">Target</th><th className="px-6 py-4">Reason</th></tr></thead>
        <tbody className="divide-y">{adminActions.map(log => (
          <tr key={log.id} className="text-sm">
            <td className="px-6 py-4 font-bold">{log.adminName}</td>
            <td className="px-6 py-4 text-xs uppercase font-bold">{log.actionType}</td>
            <td className="px-6 py-4 font-mono font-bold text-[#1B4332]">{log.shipmentId}</td>
            <td className="px-6 py-4 text-[#4A5568] italic">"{log.reason}"</td>
          </tr>
        ))}</tbody></table></div>
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
            <Route path="/financials" element={<Financials />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
