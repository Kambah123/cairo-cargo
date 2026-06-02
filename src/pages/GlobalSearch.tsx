import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Search, User, Package, ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import PriorityChips from '@/components/PriorityChips';

export default function GlobalSearch() {
  const { shipments } = useData();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return shipments.filter(s =>
      s.trackingNumber.toLowerCase().includes(q) ||
      s.senderName.toLowerCase().includes(q) ||
      s.receiverName.toLowerCase().includes(q) ||
      s.senderPhone.includes(q) ||
      s.receiverPhone.includes(q)
    ).slice(0, 10);
  }, [shipments, query]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-[#1B4332]">Global Intel</h1>
        <p className="text-muted-foreground">Instant cross-parameter parcel lookup</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#1B4332] to-[#3182CE] rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
        <div className="relative">
          <input
            autoFocus
            placeholder="Search tracking, phone, or names..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-20 pl-16 pr-8 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-xl focus:border-[#1B4332] transition-all outline-none text-xl font-bold"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-300 group-focus-within:text-[#1B4332] transition-colors" />
        </div>
      </div>

      <div className="space-y-4">
        {results.map(s => (
          <div key={s.id} className="bg-white border-2 rounded-[2.5rem] p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4 flex-1">
                   <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-[#EDF2F7] text-[#1B4332] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Parcel</span>
                      <p className="font-mono font-black text-2xl tracking-tighter text-[#1B4332]">{s.trackingNumber}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">Sender</p>
                          <p className="font-bold text-gray-700">{s.senderName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">Receiver</p>
                          <p className="font-bold text-gray-700">{s.receiverName}</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                   <StatusBadge status={s.status} />
                   <DestinationBadge destination={s.destination} size="sm" />
                   <PriorityChips labels={s.priorityLabels} size="sm" />
                </div>

                <Link
                  to={`/admin/shipments?id=${s.id}`}
                  className="w-full md:w-16 h-16 bg-[#F8F9FA] hover:bg-[#1B4332] hover:text-white rounded-2xl flex items-center justify-center transition-all group-hover:shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
             </div>
          </div>
        ))}

        {query.length >= 2 && results.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-white border-2 border-dashed rounded-[3rem]">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-gray-200" />
             </div>
             <div>
                <p className="text-xl font-black text-gray-400">No results found</p>
                <p className="text-sm text-gray-300">Try searching by tracking ID or phone number</p>
             </div>
          </div>
        )}

        {query.length < 2 && (
          <div className="py-24 text-center space-y-4">
             <Package className="w-16 h-16 text-gray-100 mx-auto" />
             <p className="text-gray-300 font-bold uppercase tracking-widest">Type to begin searching</p>
          </div>
        )}
      </div>
    </div>
  );
}
