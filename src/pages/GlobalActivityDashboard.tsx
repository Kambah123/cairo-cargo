import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Activity, Users, AlertTriangle, Package, Search, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalActivityDashboard() {
  const { adminActions, shipments, staff } = useData();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterActionType, setFilterActionType] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStaff, setFilterStaff] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
     setIsRefreshing(true);
     setTimeout(() => setIsRefreshing(false), 1000);
     toast.success("Activity feed synced");
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const actionsToday = adminActions.filter(a => new Date(a.timestamp) >= today);
  const shipmentsToday = shipments.filter(s => new Date(s.createdAt) >= today).length;

  // Calculate most active staff
  const staffActivityCount: Record<string, number> = {};
  actionsToday.forEach(a => {
      staffActivityCount[a.adminName] = (staffActivityCount[a.adminName] || 0) + 1;
  });
  let mostActiveStaff = 'N/A';
  let maxActions = 0;
  for (const [name, count] of Object.entries(staffActivityCount)) {
      if (count > maxActions) {
          maxActions = count;
          mostActiveStaff = name;
      }
  }

  const failedLogins = adminActions.filter(a => a.actionType === 'login_failed' && new Date(a.timestamp) >= today).length;

  const filteredActions = useMemo(() => {
    let result = adminActions;

    if (filterActionType !== 'all') {
      result = result.filter(a => {
         if (filterActionType === 'login' && a.actionType.includes('login')) return true;
         if (filterActionType === 'shipment' && (a.actionType.includes('shipment') || a.actionType.includes('status'))) return true;
         if (filterActionType === 'edit' && a.actionType.includes('edit')) return true;
         if (filterActionType === 'other' && !['login', 'shipment', 'status', 'edit'].some(t => a.actionType.includes(t))) return true;
         return false;
      });
    }

    if (filterBranch !== 'all') {
       result = result.filter(a => {
          const s = staff.find(staffMember => staffMember.id === a.adminId);
          return s?.branch === filterBranch;
       });
    }

    if (filterStaff) {
       result = result.filter(a => a.adminName.toLowerCase().includes(filterStaff.toLowerCase()));
    }

    if (dateRange.start) {
      result = result.filter(a => new Date(a.timestamp) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(a => new Date(a.timestamp) <= new Date(dateRange.end));
    }

    return result;
  }, [adminActions, filterActionType, filterBranch, filterStaff, dateRange, staff]);


  const exportCSV = () => {
    if (filteredActions.length === 0) return toast.error('No data to export');
    const headers = ['Date', 'Time', 'Staff', 'Action', 'Target ID', 'Reason'];
    const csvContent = [headers.join(','), ...filteredActions.map(a => {
        const d = new Date(a.timestamp);
        return [d.toLocaleDateString(), d.toLocaleTimeString(), `"${a.adminName}"`, `"${a.actionType}"`, `"${a.shipmentId || a.batchId || '-'}"`, `"${a.reason || '-'}"`].join(',');
    })].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `global_activity_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tight text-[#1A202C] uppercase">Global <span className="text-[#1B4332]">Activity</span> Dashboard</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Real-time network operation monitoring</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={handleRefresh} className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 hover:text-[#1B4332] transition-all ${isRefreshing ? 'animate-spin text-[#1B4332]' : ''}`}>
              <RefreshCw className="w-5 h-5" />
           </button>
           <button onClick={exportCSV} className="h-14 px-8 bg-[#1B4332] text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-3 shadow-xl shadow-[#1B4332]/20 active:scale-95 transition-all">
              <Download className="w-5 h-5" /> Export Logs
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6"><Activity className="w-6 h-6 text-emerald-600" /></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Actions Today</p>
           <p className="text-4xl font-black text-[#1A202C] tracking-tighter">{actionsToday.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6"><Users className="w-6 h-6 text-blue-600" /></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Most Active Staff</p>
           <p className="text-2xl font-black text-[#1A202C] tracking-tight truncate">{mostActiveStaff}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Failed Logins</p>
           <p className="text-4xl font-black text-[#1A202C] tracking-tighter">{failedLogins}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="w-14 h-14 bg-[#1B4332]/10 rounded-2xl flex items-center justify-center mb-6"><Package className="w-6 h-6 text-[#1B4332]" /></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipments Created</p>
           <p className="text-4xl font-black text-[#1A202C] tracking-tighter">{shipmentsToday}</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input value={filterStaff} onChange={e => setFilterStaff(e.target.value)} placeholder="Search Staff..." className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-[#1A202C] focus:border-[#1B4332] outline-none transition-all" />
             </div>
             <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm text-[#1A202C] focus:border-[#1B4332] outline-none">
                <option value="all">All Branches</option>
                <option value="cairo">Cairo</option>
                <option value="kano">Kano</option>
                <option value="abuja">Abuja</option>
             </select>
             <select value={filterActionType} onChange={e => setFilterActionType(e.target.value)} className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm text-[#1A202C] focus:border-[#1B4332] outline-none">
                <option value="all">All Actions</option>
                <option value="login">Logins</option>
                <option value="shipment">Shipments</option>
                <option value="edit">Edits</option>
             </select>
             <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-sm text-[#1A202C] focus:border-[#1B4332] outline-none" />
          </div>

          <div className="space-y-4">
             {filteredActions.length === 0 ? (
                 <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest">No matching activity</div>
             ) : (
                 filteredActions.map(action => (
                     <div key={action.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-[#1B4332]/30 transition-all group">
                         <div className="flex flex-col md:flex-row gap-4 md:items-center md:gap-8">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                                  <Users className="w-5 h-5 text-slate-400 group-hover:text-[#1B4332] transition-colors" />
                               </div>
                               <div>
                                  <p className="font-black text-[#1A202C]">{action.adminName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.find(s => s.id === action.adminId)?.branch || 'Unknown'} Branch</p>
                               </div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-slate-200" />
                            <div>
                               <p className="text-xs font-black text-[#1B4332] uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-lg inline-block mb-1">{action.actionType.replace(/_/g, ' ')}</p>
                               {(action.shipmentId || action.batchId) && (
                                   <p className="font-mono text-sm font-bold text-[#1A202C] mt-1">{action.shipmentId || action.batchId}</p>
                               )}
                               {action.reason && <p className="text-xs text-slate-500 italic mt-1">"{action.reason}"</p>}
                            </div>
                         </div>
                         <div className="flex items-center justify-between md:flex-col md:items-end gap-1 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                             <p className="text-xs font-black text-[#1A202C]">{new Date(action.timestamp).toLocaleDateString()}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(action.timestamp).toLocaleTimeString()}</p>
                         </div>
                     </div>
                 ))
             )}
          </div>
      </div>
    </div>
  );
}
