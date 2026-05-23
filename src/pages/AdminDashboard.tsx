import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import PriorityChips from '@/components/PriorityChips';
import {
  LayoutDashboard, Package, CreditCard, LogOut, Search,
  ArrowUpRight, ArrowDownRight, TrendingUp, MapPin,
  Download, DollarSign, Activity, CheckCircle, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const items = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'All Shipments', icon: Package, path: '/admin/shipments' },
    { label: 'Financials', icon: CreditCard, path: '/admin/financials' },
  ];

  return (
    <aside className="hidden md:flex w-[280px] flex-col bg-white border-r border-[#E2E8F0] h-screen sticky top-0">
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="CargoFlow" className="w-7 h-7" />
          <div>
            <span className="font-bold text-[#1B4332] text-sm">CargoFlow</span>
            <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide">Admin Dashboard</p>
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

function Overview() {
  const { shipments, batches } = useData();

  // Stats
  const today = new Date().toISOString().slice(0, 10);
  const todayShipments = shipments.filter((s) => s.createdAt.startsWith(today));
  const todayRevenue = todayShipments.reduce((sum, s) => sum + s.paidAmount, 0);
  const activeBatches = batches.filter((b) => b.status === 'open').length;
  const pendingDeliveries = shipments.filter((s) => s.status === 'arrived').length;

  const stats = [
    { label: "Today's Shipments", value: todayShipments.length, icon: Package, trend: '+12%', trendUp: true, color: '#1B4332' },
    { label: "Today's Revenue", value: `$${todayRevenue.toFixed(0)}`, icon: DollarSign, trend: '+8%', trendUp: true, color: '#38A169' },
    { label: 'Active Batches', value: activeBatches, icon: Activity, trend: 'Open', trendUp: true, color: '#3182CE' },
    { label: 'Pending Deliveries', value: pendingDeliveries, icon: MapPin, trend: 'Action needed', trendUp: false, color: '#DD6B20' },
  ];

  // Chart data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const shipmentChartData = last7Days.map((date) => {
    const dayShipments = shipments.filter((s) => s.createdAt.startsWith(date));
    return {
      date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      Kano: dayShipments.filter((s) => s.destination === 'kano').length,
      Abuja: dayShipments.filter((s) => s.destination === 'abuja').length,
    };
  });

  const weightChartData = last7Days.map((date) => {
    const dayShipments = shipments.filter((s) => s.createdAt.startsWith(date));
    return {
      date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      weight: dayShipments.reduce((sum, s) => sum + s.weight, 0),
    };
  });

  // Pie chart - destination distribution
  const kanoCount = shipments.filter((s) => s.destination === 'kano').length;
  const abujaCount = shipments.filter((s) => s.destination === 'abuja').length;
  const pieData = [
    { name: 'Kano', value: kanoCount, color: '#38A169' },
    { name: 'Abuja', value: abujaCount, color: '#3182CE' },
  ];

  // Top routes
  const routeData = [
    { route: 'Cairo → Kano', count: kanoCount },
    { route: 'Cairo → Abuja', count: abujaCount },
  ];

  // Recent shipments
  const recentShipments = [...shipments].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">Dashboard Overview</h1>
        <p className="text-[#4A5568] text-[15px]">Real-time cargo operations across all branches</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-[#38A169]' : 'text-[#DD6B20]'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A202C]">{stat.value}</p>
            <p className="text-xs text-[#A0AEC0] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#1A202C] mb-4">Shipments by Destination (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={shipmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#A0AEC0' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Kano" fill="#38A169" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Abuja" fill="#3182CE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#1A202C] mb-4">Destination Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Top Routes */}
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <h4 className="text-xs font-medium uppercase tracking-wide text-[#A0AEC0] mb-2">Top Routes</h4>
            {routeData.map((route) => (
              <div key={route.route} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-[#4A5568]">{route.route}</span>
                <span className="text-sm font-semibold text-[#1A202C]">{route.count} shipments</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight Trend */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#1A202C] mb-4">Weight Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
            <Line type="monotone" dataKey="weight" stroke="#1B4332" strokeWidth={2} dot={{ r: 4, fill: '#1B4332' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A202C]">Recent Shipments</h3>
          <button
            onClick={() => {}}
            className="text-xs text-[#3182CE] hover:text-[#2D6A4F] transition-colors flex items-center gap-1"
          >
            View All
            <TrendingUp className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA]">
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Tracking ID</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Sender</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Destination</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Weight</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.map((s) => (
                <tr key={s.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-[#1A202C]">{s.trackingNumber}</td>
                  <td className="px-4 py-3 text-sm text-[#1A202C]">{s.senderName}</td>
                  <td className="px-4 py-3"><DestinationBadge destination={s.destination} size="sm" /></td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">{s.weight}kg</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">${s.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AllShipments() {
  const { shipments } = useData();
  const [search, setSearch] = useState('');
  const [filterDest, setFilterDest] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filtered = shipments.filter((s) => {
    const matchSearch = !search ||
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.senderName.toLowerCase().includes(search.toLowerCase());
    const matchDest = !filterDest || s.destination === filterDest;
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchDest && matchStatus;
  });

  const exportCSV = () => {
    const headers = ['Tracking Number', 'Sender', 'Receiver', 'Destination', 'Weight', 'Status', 'Total Amount', 'Paid', 'Balance', 'Date'];
    const rows = filtered.map((s) => [
      s.trackingNumber, s.senderName, s.receiverName, s.destination,
      s.weight, s.status, s.totalAmount, s.paidAmount, s.balanceDue,
      new Date(s.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">All Shipments</h1>
        <p className="text-[#4A5568] text-[15px]">Complete view of all shipments across branches</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] placeholder:text-[#A0AEC0]"
            />
          </div>
          <select
            value={filterDest}
            onChange={(e) => setFilterDest(e.target.value)}
            className="h-10 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white"
          >
            <option value="">All Destinations</option>
            <option value="kano">Kano</option>
            <option value="abuja">Abuja</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white"
          >
            <option value="">All Statuses</option>
            <option value="received">Received</option>
            <option value="awaiting_flight">Awaiting Flight</option>
            <option value="shipped">Shipped</option>
            <option value="arrived">Arrived</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="delivered">Delivered</option>
          </select>
          <button
            onClick={exportCSV}
            className="h-10 px-4 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0]">
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Tracking ID</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Sender</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Receiver</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Dest</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Weight</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Total</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Balance</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-[#1A202C]">{s.trackingNumber}</td>
                  <td className="px-4 py-3 text-sm text-[#1A202C]">{s.senderName}</td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">{s.receiverName}</td>
                  <td className="px-4 py-3"><DestinationBadge destination={s.destination} size="sm" /></td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">{s.weight}kg</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">${s.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${s.balanceDue > 0 ? 'text-[#DD6B20]' : 'text-[#38A169]'}`}>
                      ${s.balanceDue}
                    </span>
                  </td>
                  <td className="px-4 py-3"><PriorityChips labels={s.priorityLabels} size="sm" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-[#A0AEC0]">
                    No shipments found
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

function Financials() {
  const { shipments } = useData();
  const [filter, setFilter] = useState<'all' | 'balance_due'>('all');

  const totalRevenue = shipments.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCollected = shipments.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalOutstanding = shipments.reduce((sum, s) => sum + s.balanceDue, 0);

  const filtered = shipments.filter((s) => {
    if (filter === 'balance_due') return s.balanceDue > 0;
    return true;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">Financials</h1>
        <p className="text-[#4A5568] text-[15px]">Revenue tracking and outstanding balances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#EBF8FF] rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#3182CE]" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#A0AEC0]">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-[#1A202C]">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#C6F6D5] rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-[#38A169]" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#A0AEC0]">Collected</span>
          </div>
          <p className="text-2xl font-bold text-[#38A169]">${totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#FEEBC8] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#DD6B20]" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#A0AEC0]">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-[#DD6B20]">${totalOutstanding.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all' ? 'bg-[#1B4332] text-white' : 'bg-white text-[#4A5568] border border-[#E2E8F0] hover:bg-[#EDF2F7]'
          }`}
        >
          All Shipments
        </button>
        <button
          onClick={() => setFilter('balance_due')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'balance_due' ? 'bg-[#DD6B20] text-white' : 'bg-white text-[#4A5568] border border-[#E2E8F0] hover:bg-[#EDF2F7]'
          }`}
        >
          Balance Due
        </button>
      </div>

      {/* Financial Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0]">
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Tracking ID</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Customer</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Total Amount</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Paid</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Balance</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-[#1A202C]">{s.trackingNumber}</td>
                  <td className="px-4 py-3 text-sm text-[#1A202C]">{s.senderName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1A202C]">${s.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-[#38A169]">${s.paidAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${s.balanceDue > 0 ? 'text-[#DD6B20]' : 'text-[#38A169]'}`}>
                      ${s.balanceDue.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.balanceDue > 0 ? (
                      <span className="px-2 py-0.5 bg-[#FEEBC8] text-[#DD6B20] text-[11px] font-medium rounded">Pending</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#C6F6D5] text-[#38A169] text-[11px] font-medium rounded">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#A0AEC0]">
                    No shipments found
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
          </Routes>
        </main>
      </div>
    </div>
  );
}
