import { useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import BatchManager from '@/pages/BatchManager';
import SackManager from '@/pages/SackManager';
import GlobalSearch from '@/pages/GlobalSearch';
import CreateShipment from '@/components/CreateShipment';
import { Plus, List, Layers, LogOut, Printer, Search, Copy, Edit2, ArrowLeftRight } from 'lucide-react';
import type { Shipment, ShipmentStatus } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = [
    { label: 'Dashboard', icon: List, path: '/cairo' },
    { label: 'Create Shipment', icon: Plus, path: '/cairo/new' },
    { label: 'My Shipments', icon: List, path: '/cairo/shipments' },
    { label: 'Sack Management', icon: Layers, path: '/cairo/sacks' },
    { label: 'Intel Search', icon: Search, path: '/cairo/search' },
    { label: 'Batch Manager', icon: Layers, path: '/cairo/batches' },
    { label: 'Return Shipments', icon: ArrowLeftRight, path: '/cairo/returns' }
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
                          s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.senderPhone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const isMine = s.createdBy === user?.id;
      return isMine && matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter, user]);

  const handleDuplicate = (s: Shipment) => {
    const { id, trackingNumber, createdAt, updatedAt, batchId, status, ...rest } = s;
    setEditingShipment({ ...rest, id: '', trackingNumber: '', createdAt: '', updatedAt: '', status: 'received' } as any);
  };

  if (editingShipment) {
    return <CreateShipment initialData={editingShipment} onComplete={() => setEditingShipment(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">My Shipments</h1>
        <div className="flex flex-1 w-full md:w-auto gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input placeholder="Search tracking, names, phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-10 pl-9 pr-4 border rounded-xl bg-white" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-10 border rounded-xl px-3 bg-white text-sm">
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="awaiting_flight">Awaiting Flight</option>
                <option value="shipped">Shipped</option>
                <option value="arrived">Arrived</option>
            </select>
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tracking ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Details</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Financials</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filteredShipments.length > 0 ? filteredShipments.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-sm">{s.trackingNumber}</td>
                            <td className="px-6 py-4">
                                <p className="text-sm font-medium">{s.senderName} → {s.receiverName}</p>
                                <p className="text-[10px] text-gray-500">{s.itemDescription} ({s.weight}kg)</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm font-bold">${s.totalAmount}</p>
                                <p className={`text-[10px] ${s.balanceDue > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {s.balanceDue > 0 ? `Due: $${s.balanceDue}` : 'Fully Paid'}
                                </p>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={s.status} size="sm" /></td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleDuplicate(s)} title="Duplicate" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Copy className="w-4 h-4" /></button>
                                    {s.status === 'received' && (
                                        <button onClick={() => setEditingShipment(s)} title="Edit" className="p-2 hover:bg-gray-100 rounded-lg text-blue-500"><Edit2 className="w-4 h-4" /></button>
                                    )}
                                    <button onClick={() => window.print()} title="Print" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Printer className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No shipments found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function ReturnShipments() {
  const { shipments } = useData();
  const returns = shipments.filter(s => s.status === 'returned');
  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Returns from Nigeria</h1>
        <div className="bg-white border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr><th className="px-6 py-4">Tracking ID</th><th className="px-6 py-4">Original Receiver</th><th className="px-6 py-4">Reason</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y">
                    {returns.map(s => (
                        <tr key={s.id}>
                            <td className="px-6 py-4 font-mono font-bold">{s.trackingNumber}</td>
                            <td className="px-6 py-4">{s.receiverName}</td>
                            <td className="px-6 py-4 text-sm italic">"{s.refusalReason || 'No reason provided'}"</td>
                            <td className="px-6 py-4"><StatusBadge status={s.status} size="sm" /></td>
                        </tr>
                    ))}
                    {returns.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No returned shipments</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default function CairoDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><div className="flex pt-14"><Sidebar /><main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]"><Routes><Route path="/" element={<MyShipments />} /><Route path="/new" element={<CreateShipment />} /><Route path="/shipments" element={<MyShipments />} /><Route path="/sacks" element={<SackManager />} /><Route path="/search" element={<GlobalSearch />} /><Route path="/batches" element={<BatchManager />} /><Route path="/returns" element={<ReturnShipments />} /></Routes></main></div></div>
  );
}
