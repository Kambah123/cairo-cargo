import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  Plus, Layers, X,
  Printer,
  Trash2,
  Search,
  PlaneTakeoff,
  PackageCheck
} from 'lucide-react';
import { toast } from 'sonner';
import type { Batch, Shipment, Destination } from '@/types';
import DestinationBadge from '@/components/DestinationBadge';

export default function BatchManager() {
  const { batches, shipments, addBatch, updateBatch, updateShipment } = useData();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batchSearch, setBatchSearch] = useState('');
  const [shipmentSearch, setShipmentSearch] = useState('');

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
      await updateBatch(batchId, {
        shipmentCount: batch.shipmentCount + 1,
        totalWeight: batch.totalWeight + shipment.weight,
        totalRevenue: batch.totalRevenue + shipment.totalAmount
      });
      toast.success('Added');
    } catch { toast.error('Failed'); }
  };

  const removeFromBatch = async (batchId: string, shipment: Shipment) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    try {
      await updateShipment(shipment.id, { batchId: '', status: 'received' });
      await updateBatch(batchId, {
        shipmentCount: Math.max(0, batch.shipmentCount - 1),
        totalWeight: Math.max(0, batch.totalWeight - shipment.weight),
        totalRevenue: Math.max(0, batch.totalRevenue - shipment.totalAmount)
      });
      toast.success('Removed');
    } catch { toast.error('Failed'); }
  };

  const updateBatchStatus = async (batchId: string, newStatus: Batch['status']) => {
    try {
      await updateBatch(batchId, { status: newStatus });
      toast.success(`Batch updated to ${newStatus}`);
      const updated = batches.find(b => b.id === batchId);
      if (updated) setSelectedBatch({ ...updated, status: newStatus });
    } catch { toast.error('Failed'); }
  };

  const filteredBatches = batches.filter(b => b.id.toLowerCase().includes(batchSearch.toLowerCase()));
  const batchShipments = shipments.filter(s => s.batchId === selectedBatch?.id);
  const availableShipments = shipments.filter(s => !s.batchId && s.status === 'received' && (selectedBatch ? s.destination === selectedBatch.destination : true) && s.trackingNumber.toLowerCase().includes(shipmentSearch.toLowerCase()));

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Batch Management</h1>
          <p className="text-sm text-gray-500">Organize shipments into flights</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-4 bg-[#1B4332] text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search batches..." value={batchSearch} onChange={e => setBatchSearch(e.target.value)} className="w-full h-10 pl-9 pr-4 border rounded-xl bg-white text-sm" />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-auto pr-2">
            {filteredBatches.map(b => (
              <div key={b.id} onClick={() => setSelectedBatch(b)} className={`p-4 bg-white rounded-xl border-2 transition-all cursor-pointer ${selectedBatch?.id === b.id ? 'border-[#1B4332] bg-green-50/30' : 'border-transparent hover:border-gray-200'}`}>
                <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-[#1B4332]">{b.id}</span>
                    <DestinationBadge destination={b.destination} size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${b.status === 'open' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <span className="text-[10px] font-bold uppercase text-gray-500">{b.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                  <div className="flex gap-3">
                    <span>{b.shipmentCount} items</span>
                    <span>{b.totalWeight.toFixed(1)} kg</span>
                  </div>
                  <span>{new Date(b.flightDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {filteredBatches.length === 0 && <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-xl">No batches found</div>}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedBatch ? (
            <div className="bg-white border rounded-2xl flex flex-col h-[700px] shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                    <h2 className="font-bold text-lg">{selectedBatch.id}</h2>
                    <p className="text-xs text-gray-500">Destination: {selectedBatch.destination.toUpperCase()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePrintManifest} className="h-10 px-3 border rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
                    <Printer className="w-4 h-4" /> Manifest
                  </button>

                  {selectedBatch.status === 'open' && (
                    <button onClick={() => updateBatchStatus(selectedBatch.id, 'ready_for_flight')} className="h-10 px-4 bg-[#1B4332] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm">
                      <PackageCheck className="w-4 h-4" /> Ready for Flight
                    </button>
                  )}
                  {selectedBatch.status === 'ready_for_flight' && user?.role === 'admin' && (
                    <button onClick={() => updateBatchStatus(selectedBatch.id, 'shipped')} className="h-10 px-4 bg-blue-600 text-white text-sm font-bold rounded-xl flex items-center gap-2">
                      <PlaneTakeoff className="w-4 h-4" /> Mark as Shipped
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b bg-gray-50/50">
                <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Items</p>
                    <p className="font-bold text-lg">{selectedBatch.shipmentCount}</p>
                </div>
                <div className="text-center border-x">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Weight</p>
                    <p className="font-bold text-lg">{selectedBatch.totalWeight.toFixed(1)}kg</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Potential Rev.</p>
                    <p className="font-bold text-lg text-[#1B4332]">${selectedBatch.totalRevenue.toFixed(0)}</p>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <PackageCheck className="w-3 h-3" /> Shipments in this Batch
                  </h3>
                  <div className="space-y-2">
                    {batchShipments.map(s => (
                      <div key={s.id} className="p-4 bg-white border rounded-xl flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                {batchShipments.indexOf(s) + 1}
                            </div>
                            <div>
                                <p className="text-sm font-mono font-bold text-gray-700">{s.trackingNumber}</p>
                                <p className="text-[10px] text-gray-400">{s.senderName} → {s.receiverName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs font-bold">{s.weight} kg</p>
                                <p className="text-[10px] text-gray-400">${s.totalAmount}</p>
                            </div>
                            {selectedBatch.status === 'open' && (
                                <button onClick={() => removeFromBatch(selectedBatch.id, s)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                      </div>
                    ))}
                    {batchShipments.length === 0 && <div className="py-12 text-center text-gray-400 italic text-sm">No shipments added yet</div>}
                  </div>
                </div>

                {selectedBatch.status === 'open' && (
                  <div className="space-y-3 pt-6 border-t">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                          <Plus className="w-3 h-3" /> Available for Destination
                        </h3>
                        <div className="relative w-48">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input placeholder="Filter..." value={shipmentSearch} onChange={e => setShipmentSearch(e.target.value)} className="w-full h-8 pl-7 pr-3 border rounded-lg bg-white text-xs" />
                        </div>
                    </div>
                    <div className="space-y-2">
                      {availableShipments.map(s => (
                        <div key={s.id} className="p-4 bg-gray-50/50 border border-dashed border-gray-300 rounded-xl flex justify-between items-center">
                          <div>
                              <p className="text-sm font-mono font-bold text-gray-500">{s.trackingNumber}</p>
                              <p className="text-[10px] text-gray-400">{s.senderName} ({s.weight}kg)</p>
                          </div>
                          <button onClick={() => addToBatch(selectedBatch.id, s)} className="px-4 py-1.5 bg-[#1B4332] text-white text-xs font-bold rounded-lg hover:bg-[#1B4332]/90 shadow-sm">
                            Add to Batch
                          </button>
                        </div>
                      ))}
                      {availableShipments.length === 0 && <div className="py-8 text-center text-gray-400 text-xs italic">No more matching shipments found</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-gray-400 space-y-4">
                <div className="p-4 bg-gray-100 rounded-full"><Layers className="w-10 h-10" /></div>
                <p className="font-medium">Select a batch to manage shipments or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="font-bold text-xl">Create Flight Batch</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400">Destination Branch</label>
                    <select name="destination" required className="w-full h-12 border-2 rounded-xl px-4 focus:border-[#1B4332] outline-none transition-colors">
                        <option value="kano">Kano (KNO)</option>
                        <option value="abuja">Abuja (ABJ)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400">Estimated Flight Date</label>
                    <input name="flightDate" type="date" required className="w-full h-12 border-2 rounded-xl px-4 focus:border-[#1B4332] outline-none transition-colors" />
                </div>
                <button type="submit" className="w-full h-14 bg-[#1B4332] text-white font-bold rounded-2xl shadow-lg hover:bg-[#1B4332]/90 transition-all transform active:scale-95">
                    Generate Batch
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
