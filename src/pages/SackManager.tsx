import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Plus, Package, Layers, Search, Printer, QrCode, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Sack, Destination } from '@/types';
import { DESTINATION_COLORS } from '@/types';
import DestinationBadge from '@/components/DestinationBadge';
import SackLabel from '@/components/SackLabel';

export default function SackManager() {
  const { shipments, sacks, addSack, updateShipment } = useData();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSack, setSelectedSack] = useState<Sack | null>(null);
  const [newSack, setNewSack] = useState({ destination: 'kano' as Destination });
  const [scanInput, setScanInput] = useState('');

  const availableParcels = useMemo(() => {
    return shipments.filter(s => s.status === 'received' && !s.sackId && s.destination === (selectedSack?.destination || newSack.destination));
  }, [shipments, selectedSack, newSack]);

  const handleCreateSack = async () => {
    const id = `SACK-${newSack.destination.slice(0,2).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const sack: Sack = {
      id,
      destination: newSack.destination,
      status: 'open',
      parcelCount: 0,
      totalWeight: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id || 'system'
    };
    await addSack(sack);
    setIsCreating(false);
    toast.success('Sack created successfully');
  };

  const handleAddParcel = async (shipmentId: string) => {
    if (!selectedSack) return;
    const s = shipments.find(x => x.id === shipmentId);
    if (!s) return;

    await updateShipment(shipmentId, { sackId: selectedSack.id });
    toast.success(`Parcel ${s.trackingNumber} added to sack`);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const s = availableParcels.find(p => p.trackingNumber === scanInput || p.id === scanInput);
    if (s) {
      handleAddParcel(s.id);
      setScanInput('');
    } else {
      toast.error('Parcel not found or already assigned');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#1B4332]">Sack Management</h1>
          <p className="text-muted-foreground">Consolidate parcels for efficient shipping</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-[#1B4332] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> New Sack
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sacks.map((sack: Sack) => (
          <div
            key={sack.id}
            onClick={() => setSelectedSack(sack)}
            className={`bg-white border-2 rounded-[2rem] p-6 cursor-pointer transition-all hover:shadow-xl ${selectedSack?.id === sack.id ? 'border-[#1B4332] ring-4 ring-[#1B4332]/5' : 'border-transparent'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <DestinationBadge destination={sack.destination} />
              <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-gray-500">{sack.status}</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EDF2F7] rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#1B4332]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Parcel Count</p>
                  <p className="text-xl font-black">{sack.parcelCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EDF2F7] rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#1B4332]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Weight</p>
                  <p className="text-xl font-black">{sack.totalWeight.toFixed(1)}kg</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center border-t pt-4">
              <p className="font-mono font-bold text-[#1B4332]">{sack.id}</p>
              <button onClick={(e) => { e.stopPropagation(); window.print(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <Printer className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedSack && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#F8F9FA] w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/20">
            <div className="p-8 border-b bg-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-4 mb-1">
                  <h2 className="text-2xl font-black tracking-tight">{selectedSack.id}</h2>
                  <DestinationBadge destination={selectedSack.destination} />
                </div>
                <p className="text-sm text-muted-foreground">Managing contents for this sack</p>
              </div>
              <button onClick={() => setSelectedSack(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                <Trash2 className="w-6 h-6 text-red-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg flex items-center gap-2"><Package className="w-5 h-5" /> Sack Contents</h3>
                  <button className="text-[10px] font-black uppercase text-[#3182CE] flex items-center gap-1"><QrCode className="w-3 h-3" /> Print Label</button>
                </div>
                <div className="space-y-3">
                  {shipments.filter(s => s.sackId === selectedSack.id).map(s => (
                    <div key={s.id} className="bg-white border-2 border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-mono font-bold text-sm">{s.trackingNumber}</p>
                        <p className="text-xs text-muted-foreground">{s.senderName} → {s.receiverName}</p>
                      </div>
                      <p className="font-bold">{s.weight}kg</p>
                    </div>
                  ))}
                  {selectedSack.parcelCount === 0 && <div className="py-12 text-center text-gray-300 italic">This sack is currently empty</div>}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-lg flex items-center gap-2 text-[#3182CE]"><Search className="w-5 h-5" /> Add Parcels</h3>
                <form onSubmit={handleScan} className="relative">
                  <input
                    autoFocus
                    placeholder="Scan tracking number..."
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 border-4 border-[#3182CE]/10 rounded-2xl bg-white shadow-inner font-mono font-bold focus:border-[#3182CE] transition-all outline-none"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </form>

                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Available for {selectedSack.destination}</p>
                   <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
                     {availableParcels.map(p => (
                       <button
                        key={p.id}
                        onClick={() => handleAddParcel(p.id)}
                        className="w-full bg-white hover:bg-blue-50 border-2 border-transparent hover:border-[#3182CE]/20 p-4 rounded-2xl flex justify-between items-center transition-all group"
                       >
                         <div className="text-left">
                           <p className="font-mono font-bold text-sm">{p.trackingNumber}</p>
                           <p className="text-xs text-muted-foreground">{p.senderName}</p>
                         </div>
                         <Plus className="w-5 h-5 text-gray-300 group-hover:text-[#3182CE] group-hover:scale-125 transition-all" />
                       </button>
                     ))}
                     {availableParcels.length === 0 && <div className="py-8 text-center text-gray-300 text-sm">No available parcels for this destination</div>}
                   </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t flex justify-end gap-4">
               <button onClick={() => setSelectedSack(null)} className="h-14 px-8 font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Close</button>
               <button onClick={() => { setSelectedSack(null); toast.success('Sack closed and ready for shipping'); }} className="h-14 px-10 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5" /> Finalize Sack
               </button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-[60] bg-[#1B4332]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#EDF2F7] rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-[#1B4332]" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Create New Sack</h2>
              <p className="text-muted-foreground">Select destination for consolidation</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(['kano', 'abuja', 'lagos'] as Destination[]).map(d => (
                   <button
                    key={d}
                    onClick={() => setNewSack({ destination: d })}
                    className={`h-24 rounded-3xl border-4 flex flex-col items-center justify-center gap-2 transition-all ${newSack.destination === d ? 'border-[#1B4332] bg-[#EDF2F7]' : 'border-gray-100 hover:border-gray-200'}`}
                   >
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DESTINATION_COLORS[d] }} />
                     <span className="font-black uppercase text-xs tracking-widest">{d}</span>
                   </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsCreating(false)} className="flex-1 h-14 font-black uppercase tracking-widest text-gray-400">Cancel</button>
              <button onClick={handleCreateSack} className="flex-1 h-14 bg-[#1B4332] text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#1B4332]/20">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden print:block">
        {sacks.map((s: Sack) => <SackLabel key={s.id} sack={s} />)}
      </div>
    </div>
  );
}
