import { Send } from 'lucide-react';
import type { Shipment } from '@/types';

interface WhatsAppButtonProps {
  shipment: Shipment;
  variant?: 'primary' | 'outline';
}

export default function WhatsAppButton({ shipment, variant = 'primary' }: WhatsAppButtonProps) {
  const handleSend = () => {
    const message = `Hello ${shipment.senderName}, your shipment with CargoFlow (ID: ${shipment.trackingNumber}) is currently ${shipment.status.replace(/_/g, ' ')}. Track here: https://cairo-cargo.com/track/${shipment.trackingNumber}`;
    const phone = shipment.senderPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (variant === 'outline') {
    return (
      <button
        onClick={handleSend}
        className="flex items-center gap-2 px-4 py-2 border-2 border-[#25D366] text-[#25D366] rounded-xl font-bold text-xs uppercase hover:bg-[#25D366] hover:text-white transition-all"
      >
        <Send className="w-4 h-4" /> WhatsApp
      </button>
    );
  }

  return (
    <button
      onClick={handleSend}
      className="w-full h-14 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
    >
      <Send className="w-5 h-5" /> Send WhatsApp Update
    </button>
  );
}
