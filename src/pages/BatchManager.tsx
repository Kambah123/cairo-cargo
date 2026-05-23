import { useState } from 'react';
import { useData } from '@/context/DataContext';
import {
  Plus, Layers, X,
  CheckCircle,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import type { Batch, Shipment, Destination } from '@/types';
import DestinationBadge from '@/components/DestinationBadge';

export default function BatchManager() {
  const { batches, shipments, addBatch, updateBatch, updateShipment } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dest = formData.get('destination') as Destination;
    const date = formData.get('flightDate') as string;
    const dateStr = date.replace(/-/g, '').slice(2);
    const destCode = dest === 'kano' ? 'KNO' : 'ABJ';
    const batchId = `FL-CAR-${destCode}-${dateStr}-A`;
    try {
      const newBatch: Batch = { id: batchId, destination: dest, flightDate: date, status: 'open', shipmentCount: 0, totalWeight: 0, totalRevenue: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await addBatch(newBatch);
      setIsCreateModalOpen(false);
      toast.success('Created');
    } catch { toast.error('Failed'); }
  };

  const addToBatch = async (batchId: string, shipment: Shipment) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    try {
      await updateShipment(shipment.id, { batchId, status: 'awaiting_flight' });
      await updateBatch(batchId, { shipmentCount: batch.shipmentCount + 1, totalWeight: batch.totalWeight + shipment.weight, totalRevenue: batch.totalRevenue + shipment.totalAmount });
      toast.success('Added');
    } catch { toast.error('Failed'); }
  };

  const closeBatch = async (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    try {
      const batchShipments = shipments.filter(s => s.batchId === batchId);
      await Promise.all(batchShipments.map(s => updateShipment(s.id, { status: 'shipped' })));
      await updateBatch(batchId, { status: 'shipped' });
      toast.success('Shipped');
      setSelectedBatch(null);
    } catch { toast.error('Failed'); }
  };

  const availableShipments = shipments.filter(s => !s.batchId && s.status === 'received' && (selectedBatch ? s.destination === selectedBatch.destination : true));

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold">Batch Management</h1></div><button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-4 bg-[#1B4332] text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> New Batch</button></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Layers className="w-4 h-4" /> Active</h3>
          <div className="space-y-3">{batches.map(b => (
            <div key={b.id} onClick={() => setSelectedBatch(b)} className={`p-4 rounded-xl border cursor-pointer ${selectedBatch?.id === b.id ? 'border-[#1B4332] ring-1 ring-[#1B4332]' : ''}`}>
              <div className="flex justify-between mb-2"><span className="font-mono text-xs font-bold">{b.id}</span><DestinationBadge destination={b.destination} size="sm" /></div>
              <div className="flex gap-4 text-[10px] text-gray-500"><span>{b.shipmentCount} items</span><span>{new Date(b.flightDate).toLocaleDateString()}</span></div>
            </div>
          ))}</div>
        </div>
        <div className="lg:col-span-2">
          {selectedBatch ? (
            <div className="bg-white border rounded-2xl flex flex-col h-[600px]">
              <div className="p-6 border-b flex justify-between items-center"><h2 className="font-bold">{selectedBatch.id}</h2><div className="flex gap-2"><button className="p-2 border rounded-lg"><Printer className="w-5 h-5" /></button>{selectedBatch.status === 'open' && <button onClick={() => closeBatch(selectedBatch.id)} className="h-10 px-4 bg-[#38A169] text-white text-sm font-bold rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Ship</button>}</div></div>
              <div className="p-4 grid grid-cols-3 gap-4 border-b text-center"><div className="text-[10px] uppercase font-bold">Items<p className="font-bold text-base">{selectedBatch.shipmentCount}</p></div><div className="text-[10px] uppercase font-bold">Weight<p className="font-bold text-base">{selectedBatch.totalWeight.toFixed(1)}kg</p></div><div className="text-[10px] uppercase font-bold">Revenue<p className="font-bold text-base">${selectedBatch.totalRevenue.toFixed(2)}</p></div></div>
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {shipments.filter(s => s.batchId === selectedBatch.id).map(s => (
                  <div key={s.id} className="p-3 bg-white border rounded-lg flex justify-between"><div><p className="text-sm font-mono font-bold">{s.trackingNumber}</p><p className="text-[10px]">{s.senderName}</p></div><span className="text-xs font-bold">{s.weight}kg</span></div>
                ))}
                {selectedBatch.status === 'open' && availableShipments.map(s => (
                  <div key={s.id} className="p-3 bg-[#F8F9FA] border border-dashed rounded-lg flex justify-between items-center"><p className="text-sm font-mono">{s.trackingNumber}</p><button onClick={() => addToBatch(selectedBatch.id, s)} className="px-3 py-1 bg-[#1B4332] text-white text-[10px] font-bold rounded">Add</button></div>
                ))}
              </div>
            </div>
          ) : <div className="h-full flex items-center justify-center border-2 border-dashed rounded-2xl">Select batch</div>}
        </div>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"><div className="bg-white rounded-2xl w-full max-w-md"><div className="p-6 border-b flex justify-between items-center"><h2 className="font-bold">New Batch</h2><button onClick={() => setIsCreateModalOpen(false)}><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleCreateBatch} className="p-6 space-y-4"><select name="destination" required className="w-full h-11 border rounded-lg px-3"><option value="kano">Kano</option><option value="abuja">Abuja</option></select><input name="flightDate" type="date" required className="w-full h-11 border rounded-lg px-3" /><button type="submit" className="w-full h-11 bg-[#1B4332] text-white font-bold rounded-lg">Create</button></form>
        </div></div>
      )}
    </div>
  );
}
