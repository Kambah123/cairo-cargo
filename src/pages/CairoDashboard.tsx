import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import PriorityChips from '@/components/PriorityChips';
import {
  Plus, List, Layers, LogOut, Search, Camera, X, Check, Copy, Printer,
  Package, User, CreditCard, Tag, Send, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import type { Shipment, Destination, PriorityLabel } from '@/types';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const items = [
    { label: 'Create Shipment', icon: Plus, path: '/cairo' },
    { label: 'My Shipments', icon: List, path: '/cairo/shipments' },
    { label: 'Batch Manager', icon: Layers, path: '/cairo/batches' },
  ];

  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-white border-r border-[#E2E8F0] h-screen sticky top-0">
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="CargoFlow" className="w-7 h-7" />
          <div>
            <span className="font-bold text-[#1B4332] text-sm">CargoFlow</span>
            <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide">Cairo Office</p>
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

function CreateShipment() {
  const { addShipment, batches } = useData();
  const { user } = useAuth();
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    destination: 'kano' as Destination,
    itemDescription: '',
    weight: '',
    totalAmount: '',
    paidAmount: '',
    batchId: '',
  });

  const [priorityLabels, setPriorityLabels] = useState<PriorityLabel[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePriority = (label: PriorityLabel) => {
    setPriorityLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateTrackingNumber = () => {
    const prefix = formData.destination === 'kano' ? 'KAN' : 'ABU';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${date}-${seq}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderName || !formData.receiverName || !formData.weight) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const trackingNumber = generateTrackingNumber();
    const totalAmt = parseFloat(formData.totalAmount) || 0;
    const paidAmt = parseFloat(formData.paidAmount) || 0;
    const balance = totalAmt - paidAmt;

    // Auto-add balance_due label if there's a balance
    const finalLabels = [...priorityLabels];
    if (balance > 0 && !finalLabels.includes('balance_due')) {
      finalLabels.push('balance_due');
    }
    if (balance <= 0 && !finalLabels.includes('paid')) {
      finalLabels.push('paid');
    }

    const shipment: Shipment = {
      id: trackingNumber,
      trackingNumber,
      senderName: formData.senderName,
      senderPhone: formData.senderPhone,
      receiverName: formData.receiverName,
      receiverPhone: formData.receiverPhone,
      destination: formData.destination,
      itemDescription: formData.itemDescription,
      weight: parseFloat(formData.weight),
      weightUnit: 'kg',
      photoUrl: photoPreview || undefined,
      priorityLabels: finalLabels,
      totalAmount: totalAmt,
      paidAmount: paidAmt,
      balanceDue: balance,
      status: 'received',
      batchId: formData.batchId || undefined,
      createdBy: user?.username || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    addShipment(shipment);
    setCreatedShipment(shipment);
    setIsSubmitting(false);
    toast.success('Shipment created successfully!');
  };

  const clearForm = () => {
    setFormData({
      senderName: '', senderPhone: '', receiverName: '', receiverPhone: '',
      destination: 'kano', itemDescription: '', weight: '', totalAmount: '', paidAmount: '', batchId: '',
    });
    setPriorityLabels([]);
    setPhotoPreview(null);
    setCreatedShipment(null);
  };

  const copyTracking = () => {
    if (createdShipment) {
      navigator.clipboard.writeText(createdShipment.trackingNumber);
      toast.success('Tracking number copied!');
    }
  };

  const balanceDue = (parseFloat(formData.totalAmount) || 0) - (parseFloat(formData.paidAmount) || 0);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">Create New Shipment</h1>
        <p className="text-[#4A5568] text-[15px]">Generate tracking IDs and register parcels</p>
      </div>

      {!createdShipment ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#1A202C] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1B4332]" />
                  Customer Info
                </h3>

                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Sender Name *</label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    placeholder="Full name"
                    className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Sender Phone</label>
                  <input
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => updateField('senderPhone', e.target.value)}
                    placeholder="+20 XXX XXX XXXX"
                    className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Destination *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('destination', 'kano')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                        formData.destination === 'kano'
                          ? 'border-[#38A169] bg-[#38A169]/5 text-[#38A169]'
                          : 'border-[#E2E8F0] text-[#4A5568] hover:border-[#CBD5E0]'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#38A169]" />
                      Kano
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('destination', 'abuja')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                        formData.destination === 'abuja'
                          ? 'border-[#3182CE] bg-[#3182CE]/5 text-[#3182CE]'
                          : 'border-[#E2E8F0] text-[#4A5568] hover:border-[#CBD5E0]'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#3182CE]" />
                      Abuja
                    </button>
                  </div>
                </div>
              </div>

              {/* Parcel Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#1A202C] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#1B4332]" />
                  Parcel Details
                </h3>

                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Item Description</label>
                  <textarea
                    value={formData.itemDescription}
                    onChange={(e) => updateField('itemDescription', e.target.value)}
                    placeholder="Describe the items..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Weight (kg) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => updateField('weight', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full h-11 pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A0AEC0] font-medium">kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Receiver Name</label>
                    <input
                      type="text"
                      value={formData.receiverName}
                      onChange={(e) => updateField('receiverName', e.target.value)}
                      placeholder="Full name"
                      className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Receiver Phone</label>
                    <input
                      type="tel"
                      value={formData.receiverPhone}
                      onChange={(e) => updateField('receiverPhone', e.target.value)}
                      placeholder="+234 XXX XXX XXXX"
                      className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mt-6">
              <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Verification Photo</label>
              {!photoPreview ? (
                <label className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed border-[#CBD5E0] rounded-lg cursor-pointer hover:border-[#1B4332] hover:bg-[#EDF2F7]/30 transition-all">
                  <Camera className="w-8 h-8 text-[#A0AEC0] mb-2" />
                  <span className="text-sm text-[#4A5568]">Click or drag to upload photo of parcel on scale</span>
                  <span className="text-xs text-[#A0AEC0] mt-1">JPG, PNG up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              ) : (
                <div className="relative w-fit">
                  <img src={photoPreview} alt="Preview" className="h-[180px] rounded-lg object-cover border border-[#E2E8F0]" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#E53E3E] text-white rounded-full flex items-center justify-center hover:bg-[#C53030] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Priority Labels */}
            <div className="mt-6">
              <label className="block text-xs font-medium text-[#4A5568] mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Priority Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'express' as PriorityLabel, label: 'Express', color: '#D69E2E', bg: '#FEF3C7' },
                  { key: 'fragile' as PriorityLabel, label: 'Fragile', color: '#E53E3E', bg: '#FED7D7' },
                  { key: 'paid' as PriorityLabel, label: 'Paid', color: '#38A169', bg: '#C6F6D5' },
                ]).map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePriority(p.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border-2 transition-all ${
                      priorityLabels.includes(p.key)
                        ? 'border-current'
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: priorityLabels.includes(p.key) ? p.bg : '#EDF2F7',
                      color: priorityLabels.includes(p.key) ? p.color : '#A0AEC0',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Section */}
            <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#1A202C] flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-[#1B4332]" />
                Payment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Total Amount ($)</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => updateField('totalAmount', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Paid Amount ($)</label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => updateField('paidAmount', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Balance Due ($)</label>
                  <div className={`h-11 px-3 flex items-center rounded-lg text-sm font-semibold ${
                    balanceDue > 0 ? 'bg-[#FEEBC8] text-[#DD6B20]' : 'bg-[#C6F6D5] text-[#38A169]'
                  }`}>
                    {balanceDue.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Batch ID */}
            <div className="mt-6">
              <label className="block text-xs font-medium text-[#4A5568] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Batch / Flight ID
              </label>
              <select
                value={formData.batchId}
                onChange={(e) => updateField('batchId', e.target.value)}
                className="w-full h-11 px-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent bg-white"
              >
                <option value="">Select batch (optional)</option>
                {batches.filter((b) => b.status === 'open').map((b) => (
                  <option key={b.id} value={b.id}>{b.id} ({b.destination.toUpperCase()})</option>
                ))}
                <option value="new">+ Create New Batch</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-[#1B4332] text-white font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Tracking Number
                </>
              )}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="h-12 px-6 text-sm text-[#4A5568] hover:text-[#1A202C] transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      ) : (
        /* Success Result */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Success Banner */}
          <div className="bg-[#C6F6D5] border border-[#38A169]/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#38A169] rounded-full flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A202C]">Shipment created successfully!</p>
              <p className="text-xs text-[#4A5568]">Tracking number generated and customer notification ready</p>
            </div>
          </div>

          {/* Tracking Number */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <label className="block text-xs font-medium uppercase tracking-wide text-[#A0AEC0] mb-2">
              Tracking Number
            </label>
            <div className="flex items-center gap-3">
              <code className="text-xl font-bold text-[#1A202C] font-mono bg-[#EDF2F7] px-4 py-2 rounded-lg flex-1">
                {createdShipment.trackingNumber}
              </code>
              <button
                onClick={copyTracking}
                className="h-11 px-4 bg-[#EDF2F7] text-[#4A5568] rounded-lg hover:bg-[#E2E8F0] transition-colors flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>

          {/* Printable Sticker Preview */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1A202C]">Printable Sticker</h3>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Sticker
              </button>
            </div>

            <div className="print-sticker border-2 border-dashed border-[#CBD5E0] rounded-lg p-6 bg-white" style={{ aspectRatio: '4/6', maxWidth: '320px' }}>
              {/* Color bar */}
              <div
                className="h-3 rounded-full mb-4"
                style={{ backgroundColor: createdShipment.destination === 'kano' ? '#38A169' : '#3182CE' }}
              />
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo-icon.png" alt="" className="w-6 h-6" />
                <span className="font-bold text-[#1B4332] text-sm">CargoFlow</span>
              </div>
              {/* Barcode placeholder */}
              <div className="flex items-center justify-center gap-[2px] h-12 mb-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="bg-[#1A202C]" style={{ width: Math.random() > 0.5 ? '2px' : '1px', height: '100%' }} />
                ))}
              </div>
              <p className="text-center font-mono text-lg font-bold text-[#1A202C] mb-4">
                {createdShipment.trackingNumber}
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#E2E8F0] pb-1">
                  <span className="text-[#A0AEC0]">From:</span>
                  <span className="font-medium text-[#1A202C]">{createdShipment.senderName}</span>
                </div>
                <div className="flex justify-between border-b border-[#E2E8F0] pb-1">
                  <span className="text-[#A0AEC0]">To:</span>
                  <span className="font-medium text-[#1A202C]">{createdShipment.receiverName}</span>
                </div>
                <div className="flex justify-between border-b border-[#E2E8F0] pb-1">
                  <span className="text-[#A0AEC0]">Weight:</span>
                  <span className="font-medium text-[#1A202C]">{createdShipment.weight}kg</span>
                </div>
                <div className="flex justify-between border-b border-[#E2E8F0] pb-1">
                  <span className="text-[#A0AEC0]">Date:</span>
                  <span className="font-medium text-[#1A202C]">{new Date(createdShipment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {createdShipment.priorityLabels.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  <PriorityChips labels={createdShipment.priorityLabels} size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Preview */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[#1A202C] mb-4">WhatsApp Notification Preview</h3>
            <div className="max-w-xs mx-auto">
              <div className="bg-[#E8F5E9] rounded-2xl rounded-tl-sm p-4 text-sm text-[#1A202C]">
                <p className="font-medium mb-2">Dear {createdShipment.senderName}, your shipment is registered.</p>
                <div className="space-y-1 text-[13px]">
                  <p><strong>Tracking ID:</strong> {createdShipment.trackingNumber}</p>
                  <p><strong>Destination:</strong> {createdShipment.destination === 'kano' ? 'Kano' : 'Abuja'}</p>
                  <p><strong>Weight:</strong> {createdShipment.weight}kg</p>
                  <p><strong>Status:</strong> Received</p>
                </div>
                <p className="mt-3 text-xs text-[#4A5568]">Track at: cargoflow.app</p>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-[#A0AEC0]">Simulated WhatsApp message</span>
              </div>
            </div>
          </div>

          <button
            onClick={clearForm}
            className="w-full h-12 bg-[#EDF2F7] text-[#4A5568] font-medium rounded-lg hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Another Shipment
          </button>
        </div>
      )}
    </div>
  );
}

function ShipmentList() {
  const { shipments } = useData();
  const [search, setSearch] = useState('');
  const [filterDest, setFilterDest] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filtered = shipments.filter((s) => {
    const matchSearch = !search || s.trackingNumber.toLowerCase().includes(search.toLowerCase()) || s.senderName.toLowerCase().includes(search.toLowerCase());
    const matchDest = !filterDest || s.destination === filterDest;
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchDest && matchStatus;
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">My Shipments</h1>
        <p className="text-[#4A5568] text-[15px]">View and manage all created shipments</p>
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
              placeholder="Search by tracking number or sender..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder:text-[#A0AEC0]"
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
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0]">
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Tracking ID</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Customer</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Destination</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Weight</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium uppercase tracking-wide text-[#A0AEC0] px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((shipment) => (
                <tr key={shipment.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-[#1A202C]">{shipment.trackingNumber}</td>
                  <td className="px-4 py-3 text-sm text-[#1A202C]">{shipment.senderName}</td>
                  <td className="px-4 py-3"><DestinationBadge destination={shipment.destination} size="sm" /></td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">{shipment.weight}kg</td>
                  <td className="px-4 py-3"><StatusBadge status={shipment.status} size="sm" /></td>
                  <td className="px-4 py-3 text-sm text-[#4A5568]">{new Date(shipment.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><PriorityChips labels={shipment.priorityLabels} size="sm" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#A0AEC0]">
                    No shipments found matching your criteria
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

function BatchManager() {
  const { batches } = useData();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A202C] tracking-tight">Batch Manager</h1>
        <p className="text-[#4A5568] text-[15px]">Organize shipments into flight batches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-sm font-bold text-[#1A202C]">{batch.id}</p>
                <p className="text-xs text-[#A0AEC0] mt-0.5">{new Date(batch.createdAt).toLocaleDateString()}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                  batch.status === 'open'
                    ? 'bg-[#C6F6D5] text-[#38A169]'
                    : batch.status === 'shipped'
                    ? 'bg-[#EBF8FF] text-[#3182CE]'
                    : 'bg-[#EDF2F7] text-[#4A5568]'
                }`}
              >
                {batch.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <DestinationBadge destination={batch.destination} size="sm" />
              </div>
              <div className="flex items-center gap-1.5 text-[#4A5568]">
                <Package className="w-4 h-4" />
                <span>{batch.shipmentCount} shipments</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-[#A0AEC0]">Flight: {new Date(batch.flightDate).toLocaleDateString()}</span>
              <ChevronRight className="w-4 h-4 text-[#A0AEC0]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CairoDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <div className="flex pt-14">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto min-h-[calc(100vh-56px)]">
          <Routes>
            <Route path="/" element={<CreateShipment />} />
            <Route path="/shipments" element={<ShipmentList />} />
            <Route path="/batches" element={<BatchManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
