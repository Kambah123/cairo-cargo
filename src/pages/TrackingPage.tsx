import { useState } from 'react';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import TrackingStepper from '@/components/TrackingStepper';
import StatusBadge from '@/components/StatusBadge';
import DestinationBadge from '@/components/DestinationBadge';
import PriorityChips from '@/components/PriorityChips';
import { Search, MapPin, Package, User, Weight, Calendar, Image } from 'lucide-react';
import type { Shipment } from '@/types';

export default function TrackingPage() {
  const [trackingInput, setTrackingInput] = useState('');
  const [searchedShipment, setSearchedShipment] = useState<Shipment | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { getShipmentByTracking } = useData();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    const result = getShipmentByTracking(trackingInput.trim());
    setSearchedShipment(result || null);
    setHasSearched(true);
  };

  const quickTrack = (id: string) => {
    setTrackingInput(id);
    const result = getShipmentByTracking(id);
    setSearchedShipment(result || null);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-14">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%231B4332' stroke-width='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EDF2F7] rounded-full mb-6">
            <Package className="w-3.5 h-3.5 text-[#4A5568]" />
            <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#4A5568]">
              Official Tracking Portal
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[42px] font-bold text-[#1A202C] leading-[1.1] tracking-tight mb-4">
            Track Your Shipment
          </h1>
          <p className="text-base text-[#4A5568] max-w-md mx-auto mb-8">
            Enter your tracking number to see real-time status updates for your cargo from Cairo to Nigeria
          </p>

          {/* Tracking Input */}
          <form onSubmit={handleTrack} className="flex items-center gap-2 max-w-lg mx-auto mb-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g., KAN-20260521-0010"
                className="w-full h-14 pl-4 pr-4 text-base bg-white border border-[#E2E8F0] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-[#A0AEC0]"
              />
            </div>
            <button
              type="submit"
              className="h-14 w-14 flex items-center justify-center bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors shadow-sm shrink-0"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[13px] text-[#A0AEC0] mb-8">
            Tracking numbers start with KAN- or ABU-
          </p>

          {/* Quick track examples */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <span className="text-xs text-[#A0AEC0]">Try:</span>
            {['KAN-20260521-0010', 'ABU-20260521-0005', 'KAN-20260520-0042'].map((id) => (
              <button
                key={id}
                onClick={() => quickTrack(id)}
                className="text-xs px-2.5 py-1 bg-[#EDF2F7] text-[#4A5568] rounded-md hover:bg-[#E2E8F0] transition-colors"
              >
                {id}
              </button>
            ))}
          </div>

          {/* Tracking Result */}
          {hasSearched && (
            <div className="text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
              {searchedShipment ? (
                <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-6 md:p-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#1A202C] font-mono">
                        {searchedShipment.trackingNumber}
                      </span>
                      <StatusBadge status={searchedShipment.status} />
                    </div>
                    <DestinationBadge destination={searchedShipment.destination} />
                  </div>

                  {/* Stepper */}
                  <div className="mb-8 overflow-x-auto pb-2">
                    <TrackingStepper currentStatus={searchedShipment.status} />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#F8F9FA] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[#A0AEC0] mb-1">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium uppercase tracking-wide">Sender</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A202C]">{searchedShipment.senderName}</p>
                      <p className="text-xs text-[#4A5568]">{searchedShipment.senderPhone}</p>
                    </div>
                    <div className="bg-[#F8F9FA] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[#A0AEC0] mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium uppercase tracking-wide">Receiver</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A202C]">{searchedShipment.receiverName}</p>
                      <p className="text-xs text-[#4A5568]">{searchedShipment.receiverPhone}</p>
                    </div>
                    <div className="bg-[#F8F9FA] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[#A0AEC0] mb-1">
                        <Weight className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium uppercase tracking-wide">Weight</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A202C]">
                        {searchedShipment.weight} {searchedShipment.weightUnit}
                      </p>
                      {searchedShipment.arrivalConfirmation && (
                        <p className="text-xs text-[#4A5568]">
                          Arrival: {searchedShipment.arrivalConfirmation.currentWeight} {searchedShipment.weightUnit}
                        </p>
                      )}
                    </div>
                    <div className="bg-[#F8F9FA] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[#A0AEC0] mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium uppercase tracking-wide">Date</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A202C]">
                        {new Date(searchedShipment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[#4A5568]">
                        {new Date(searchedShipment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Item description */}
                  <div className="bg-[#F8F9FA] rounded-lg p-3 mb-4">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#A0AEC0]">Items</span>
                    <p className="text-sm text-[#1A202C] mt-1">{searchedShipment.itemDescription}</p>
                  </div>

                  {/* Priority labels */}
                  {searchedShipment.priorityLabels.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-[#A0AEC0]">Priority:</span>
                      <PriorityChips labels={searchedShipment.priorityLabels} size="sm" />
                    </div>
                  )}

                  {/* Photo */}
                  {searchedShipment.photoUrl && (
                    <div className="mt-4">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-[#A0AEC0] flex items-center gap-1 mb-2">
                        <Image className="w-3.5 h-3.5" />
                        Verification Photo
                      </span>
                      <img
                        src={searchedShipment.photoUrl}
                        alt="Parcel verification"
                        className="w-32 h-24 object-cover rounded-lg border border-[#E2E8F0]"
                      />
                    </div>
                  )}

                  {/* Delivery confirmation */}
                  {searchedShipment.deliveryConfirmation && (
                    <div className="mt-4 bg-[#C6F6D5]/30 border border-[#38A169]/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-[#38A169] mb-2">
                        <Package className="w-4 h-4" />
                        <span className="text-sm font-semibold">Delivery Confirmed</span>
                      </div>
                      <p className="text-sm text-[#1A202C]">
                        Collected by <strong>{searchedShipment.deliveryConfirmation.collectorName}</strong> on{' '}
                        {new Date(searchedShipment.deliveryConfirmation.deliveredAt).toLocaleDateString()} at{' '}
                        {new Date(searchedShipment.deliveryConfirmation.deliveredAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#FED7D7]/30 border border-[#E53E3E]/20 rounded-xl p-6 text-center">
                  <Package className="w-10 h-10 text-[#E53E3E] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#1A202C] mb-1">Shipment Not Found</h3>
                  <p className="text-sm text-[#4A5568]">
                    We couldn&apos;t find a shipment with tracking number <strong>{trackingInput}</strong>. Please double-check the number and try again.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Color legend */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#A0AEC0]">
            <span className="font-medium text-[#4A5568]">Color Guide:</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38A169]" />Kano</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3182CE]" />Abuja</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D69E2E]" />Express</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E53E3E]" />Fragile</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DD6B20]" />Balance Due</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-[13px] text-[#A0AEC0]">
        CargoFlow &copy; 2025. Cairo – Nigeria Logistics
      </footer>
    </div>
  );
}
