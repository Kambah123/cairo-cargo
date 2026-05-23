import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import {
  Plane, CheckCircle, ClipboardList, LogOut, Search,
  Weight, Calendar, X, Check
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const items = [
    { label: 'Arrivals', icon: Plane, path: '/nigeria' },
    { label: 'Deliveries', icon: CheckCircle, path: '/nigeria/deliveries' },
    { label: 'Pickup Log', icon: ClipboardList, path: '/nigeria/pickups' },
  ];

  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-white border-r border-[#E2E8F0] h-screen sticky top-0">
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="CargoFlow" className="w-7 h-7" />
          <div>
            <span className="font-bold text-[#1B4332] text-sm">CargoFlow</span>
            <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide">Nigeria Office</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#EDF2F7] text-[#1B4332] border-l-[3px] border-[#1B4332]'
                  : 'text-[#4A5568] hover:bg-[#EDF2F7]/50 hover:text-[#1A202C]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#E2E8F0]">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E53E3E] hover:bg-[#FED7D7]/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

function ArrivalModal({ shipment, onClose, onConfirm }: {
  shipment: Shipment;
  onClose: () => void;
  onConfirm: (data: { currentWeight: number; conditionNotes: string }) => void;
}) {
  const [currentWeight, setCurrentWeight] = useState(shipment.weight.toString());
  const [conditionNotes, setConditionNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1A202C]">Confirm Arrival</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#EDF2F7] transition-colors">
            <X className="w-5 h-5 text-[#A0AEC0]" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
          <p className="text-sm font-mono font-bold text-[#1A202C]">{shipment.trackingNumber}</p>
          <p className="text-xs text-[#4A5568] mt-1">{shipment.senderName} → {shipment.receiverName}</p>
          <div className="flex items-center gap-2 mt-2">
            <DestinationBadge destination={shipment.destination} size="sm" />
            <span className="text-xs text-[#4A5568]">Original: {shipment.weight}kg</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Current Weight (kg)</label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              step="0.01"
              className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Condition Notes</label>
            <textarea
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="Any observations about the parcel condition..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none placeholder:text-[#A0AEC0]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 text-sm text-[#4A5568] hover:text-[#1A202C] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm({ currentWeight: parseFloat(currentWeight) || 0, conditionNotes });
              onClose();
            }}
            className="flex-1 h-11 bg-[#1B4332] text-white font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirm Arrival
          </button>
        </div>
      </div>
    </div>
  );
}

function DeliveryModal({ shipment, onClose, onConfirm }: {
  shipment: Shipment;
  onClose: () => void;
  onConfirm: (data: { collectorName: string; collectorPhone: string }) => void;
}) {
  const [collectorName, setCollectorName] = useState('');
  const [collectorPhone, setCollectorPhone] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1A202C]">Confirm Delivery</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#EDF2F7] transition-colors">
            <X className="w-5 h-5 text-[#A0AEC0]" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
          <p className="text-sm font-mono font-bold text-[#1A202C]">{shipment.trackingNumber}</p>
          <p className="text-xs text-[#4A5568] mt-1">Receiver: {shipment.receiverName}</p>
          <DestinationBadge destination={shipment.destination} size="sm" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Collector Name *</label>
            <input
              type="text"
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              placeholder="Full name of person collecting"
              className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] placeholder:text-[#A0AEC0]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Collector Phone</label>
            <input
              type="tel"
              value={collectorPhone}
              onChange={(e) => setCollectorPhone(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] placeholder:text-[#A0AEC0]"
            />
          </div>
          <div className="p-3 bg-[#C6F6D5]/20 rounded-lg border border-[#38A169]/20">
            <label className="flex items-center gap-2 text-sm text-[#1A202C]">
              <input type="checkbox" className="rounded border-[#CBD5E0]" defaultChecked />
              <span>Collector confirmed receipt of parcel</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 text-sm text-[#4A5568] hover:text-[#1A202C] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!collectorName.trim()) {
                toast.error('Please enter collector name');
                return;
              }
              onConfirm({ collectorName, collectorPhone });
              onClose();
            }}
            className="flex-1 h-11 bg-[#1B4332] text-white font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Complete Delivery
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
  const [filter, setFilter] = useState('');

  // Show shipments that are shipped (ready for arrival confirmation)
  const arrivalsList = shipments.filter((s) =>
    s.status === 'shipped' &&
    (!filter || s.trackingNumber.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleConfirm = (data: { currentWeight: number; conditionNotes: string }) => {
    if (!selectedShipment || !user) return;
    confirmArrival(selectedShipment.id, {
      confirmedAt: new Date().toISOString(),
      confirmedBy: user.username,
      currentWeight: data.currentWeight,
      conditionNotes: data.conditionNotes,
    });
    toast.success(`Arrival confirmed for ${selectedShipment.trackingNumber}`);
    setSelectedShipment(null);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">Confirm Arrivals</h1>
        <p className="text-[#4A5568] text-[15px]">Mark incoming shipments as arrived</p>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by tracking number..."
          className="w-full h-10 pl-9 pr-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white placeholder:text-[#A0AEC0]"
        />
      </div>

      <div className="space-y-3">
        {arrivalsList.map((shipment) => (
          <div
            key={shipment.id}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ borderLeftWidth: '4px', borderLeftColor: shipment.destination === 'kano' ? '#38A169' : '#3182CE' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-[#1A202C]">{shipment.trackingNumber}</span>
                <DestinationBadge destination={shipment.destination} size="sm" />
              </div>
              <p className="text-sm text-[#4A5568]">{shipment.senderName} → {shipment.receiverName}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#A0AEC0]">
                <span className="flex items-center gap-1"><Weight className="w-3 h-3" /> {shipment.weight}kg</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(shipment.createdAt).toLocaleDateString()}</span>
                {shipment.batchId && <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> {shipment.batchId}</span>}
              </div>
            </div>
            <button
              onClick={() => setSelectedShipment(shipment)}
              className="h-10 px-4 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center gap-2 shrink-0"
            >
              <Check className="w-4 h-4" />
              Confirm Arrival
            </button>
          </div>
        ))}

        {arrivalsList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E2E8F0]">
            <Plane className="w-10 h-10 text-[#A0AEC0] mx-auto mb-3" />
            <p className="text-sm text-[#4A5568]">No shipments awaiting arrival confirmation</p>
          </div>
        )}
      </div>

      {selectedShipment && (
        <ArrivalModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

function Deliveries() {
  const { shipments, confirmDelivery } = useData();
  const { user } = useAuth();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filter, setFilter] = useState('');

  // Show shipments that are arrived (ready for delivery)
  const readyForPickup = shipments.filter((s) =>
    s.status === 'arrived' &&
    (!filter || s.trackingNumber.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleConfirm = (data: { collectorName: string; collectorPhone: string }) => {
    if (!selectedShipment || !user) return;
    confirmDelivery(selectedShipment.id, {
      collectorName: data.collectorName,
      collectorPhone: data.collectorPhone,
      deliveredAt: new Date().toISOString(),
      confirmedBy: user.username,
    });
    toast.success(`Delivery confirmed for ${selectedShipment.trackingNumber}`);
    setSelectedShipment(null);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">Deliveries</h1>
        <p className="text-[#4A5568] text-[15px]">Confirm pickup and delivery of parcels</p>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by tracking number..."
          className="w-full h-10 pl-9 pr-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white placeholder:text-[#A0AEC0]"
        />
      </div>

      <div className="space-y-3">
        {readyForPickup.map((shipment) => (
          <div
            key={shipment.id}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ borderLeftWidth: '4px', borderLeftColor: shipment.destination === 'kano' ? '#38A169' : '#3182CE' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-[#1A202C]">{shipment.trackingNumber}</span>
                <DestinationBadge destination={shipment.destination} size="sm" />
              </div>
              <p className="text-sm text-[#4A5568]">Receiver: {shipment.receiverName}</p>
              {shipment.arrivalConfirmation && (
                <p className="text-xs text-[#A0AEC0] mt-1">
                  Arrived: {new Date(shipment.arrivalConfirmation.confirmedAt).toLocaleDateString()} at {new Date(shipment.arrivalConfirmation.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedShipment(shipment)}
              className="h-10 px-4 bg-[#38A169] text-white text-sm font-medium rounded-lg hover:bg-[#2F855A] transition-colors flex items-center gap-2 shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Delivery
            </button>
          </div>
        ))}

        {readyForPickup.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E2E8F0]">
            <CheckCircle className="w-10 h-10 text-[#A0AEC0] mx-auto mb-3" />
            <p className="text-sm text-[#4A5568]">No shipments ready for delivery</p>
          </div>
        )}
      </div>

      {selectedShipment && (
        <DeliveryModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

function PickupLog() {
  const { shipments } = useData();
  const [search, setSearch] = useState('');

  const delivered = shipments
    .filter((s) => s.status === 'delivered' && s.deliveryConfirmation)
    .filter((s) =>
      !search ||
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.deliveryConfirmation!.collectorName.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">Pickup Log</h1>
        <p className="text-[#4A5568] text-[15px]">Record of all completed deliveries</p>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by tracking number or collector name..."
          className="w-full h-10 pl-9 pr-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white placeholder:text-[#A0AEC0]"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0]">
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Tracking ID</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Collector Name</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Phone</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Delivery Time</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Destination</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {delivered.map((s) => (
                <tr key={s.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-[#1A202C]">{s.trackingNumber}</td>
                  <td className="px-4 py-3 text-sm text-[#1A202C]">{s.deliveryConfirmation!.collectorName}</td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">{s.deliveryConfirmation!.collectorPhone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">
                    {new Date(s.deliveryConfirmation!.deliveredAt).toLocaleDateString()} {' '}
                    {new Date(s.deliveryConfirmation!.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3"><DestinationBadge destination={s.destination} size="sm" /></td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
                </tr>
              ))}
              {delivered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#A0AEC0]">
                    No deliveries recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function NigeriaDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <div className="flex pt-14">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]">
          <Routes>
            <Route path="/" element={<Arrivals />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/pickups" element={<PickupLog />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
