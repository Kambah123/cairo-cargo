import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Download, ArrowLeft, LogIn, Package, Activity, FileEdit, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffActivityMonitor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adminActions, staff } = useData();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [actionType, setActionType] = useState('all');

  const staffMember = staff.find(s => s.id === id);
  const actions = adminActions.filter(a => a.adminId === id);

  const filteredActions = useMemo(() => {
    let result = actions;
    if (actionType !== 'all') {
      result = result.filter(a => {
         if (actionType === 'login' && a.actionType.includes('login')) return true;
         if (actionType === 'shipment' && (a.actionType.includes('shipment') || a.actionType.includes('status'))) return true;
         if (actionType === 'edit' && a.actionType.includes('edit')) return true;
         if (actionType === 'other' && !['login', 'shipment', 'status', 'edit'].some(t => a.actionType.includes(t))) return true;
         return false;
      });
    }
    if (dateRange.start) {
      result = result.filter(a => new Date(a.timestamp) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(a => new Date(a.timestamp) <= new Date(dateRange.end));
    }
    return result;
  }, [actions, actionType, dateRange]);

  const exportCSV = () => {
    if (filteredActions.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Date', 'Time', 'Action', 'Target ID', 'Old Value', 'New Value', 'Reason'];
    const csvContent = [
      headers.join(','),
      ...filteredActions.map(a => {
        const d = new Date(a.timestamp);
        return [
          d.toLocaleDateString(),
          d.toLocaleTimeString(),
          `"${a.actionType}"`,
          `"${a.shipmentId || a.batchId || '-'}"`,
          `"${a.oldValue || '-'}"`,
          `"${a.newValue || '-'}"`,
          `"${a.reason || '-'}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `staff_activity_${staffMember?.name.replace(/\s+/g, '_') || id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Activity log exported');
  };

  const getActionIcon = (type: string) => {
    if (type.includes('login')) return <LogIn className="w-4 h-4" />;
    if (type.includes('shipment')) return <Package className="w-4 h-4" />;
    if (type.includes('status')) return <Activity className="w-4 h-4" />;
    if (type.includes('edit')) return <FileEdit className="w-4 h-4" />;
    if (type.includes('staff')) return <UserPlus className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (!staffMember) {
    return <div className="p-8 text-center text-slate-500">Staff member not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/staff')} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
           <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
           <h1 className="text-3xl font-black tracking-tight text-[#1A202C] uppercase">{staffMember.name} <span className="text-[#1B4332]">Activity</span></h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{staffMember.role.replace('_', ' ')} • {staffMember.branch} Branch</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
         <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Action Type</label>
            <select value={actionType} onChange={e => setActionType(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:border-[#1B4332] uppercase tracking-wider">
               <option value="all">All Activities</option>
               <option value="login">Authentication</option>
               <option value="shipment">Shipments & Status</option>
               <option value="edit">Record Edits</option>
               <option value="other">Other Operations</option>
            </select>
         </div>
         <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Start Date</label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:border-[#1B4332]" />
         </div>
         <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">End Date</label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:border-[#1B4332]" />
         </div>
         <button onClick={exportCSV} className="h-12 px-6 bg-[#1B4332] text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 hover:bg-[#2d6a4f] transition-colors shadow-lg whitespace-nowrap">
            <Download className="w-4 h-4" /> Export CSV
         </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
         <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {filteredActions.length === 0 ? (
                <div className="text-center text-slate-400 py-10 font-bold text-sm uppercase tracking-widest">No activity found for selected filters</div>
            ) : (
                filteredActions.map((action) => (
                    <div key={action.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#1B4332] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-[2px] md:ml-0">
                          {getActionIcon(action.actionType)}
                       </div>
                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#1B4332] bg-emerald-100 px-2 py-1 rounded-md">{action.actionType.replace(/_/g, ' ')}</span>
                             <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(action.timestamp).toLocaleDateString()}</p>
                                <p className="text-[10px] font-black text-slate-500">{new Date(action.timestamp).toLocaleTimeString()}</p>
                             </div>
                          </div>
                          {action.shipmentId && <p className="text-xs font-black text-[#1A202C] mb-1 font-mono">{action.shipmentId}</p>}
                          {action.reason && <p className="text-xs text-slate-600 italic">"{action.reason}"</p>}
                          {(action.oldValue || action.newValue) && (
                             <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                                {action.oldValue && <p className="text-[10px] text-red-500 line-through truncate">Old: {action.oldValue}</p>}
                                {action.newValue && <p className="text-[10px] text-emerald-600 truncate">New: {action.newValue}</p>}
                             </div>
                          )}
                       </div>
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
}
