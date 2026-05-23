import { QRCodeSVG } from 'qrcode.react';
import type { Shipment } from '@/types';
import { DESTINATION_COLORS, PRIORITY_CONFIG } from '@/types';

export default function ShipmentTag({ shipment }: { shipment: Shipment }) {
  const trackingUrl = `${window.location.origin}/?tracking=${shipment.trackingNumber}`;
  const destColor = DESTINATION_COLORS[shipment.destination] || '#000';

  return (
    <div
      id="shipment-tag"
      className="w-[105mm] h-[148mm] bg-white border-8 p-6 flex flex-col justify-between overflow-hidden"
      style={{ borderColor: destColor }}
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-1" style={{ color: destColor }}>
          {shipment.destination}
        </h1>
        <div className="h-1 w-full bg-black mb-4" />
      </div>

      {/* Main Info */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <QRCodeSVG value={trackingUrl} size={180} level="H" includeMargin={true} />
        </div>

        <div className="text-center space-y-2">
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Tracking Number</p>
           <p className="text-3xl font-mono font-black border-2 border-black px-4 py-2 bg-gray-50">
             {shipment.trackingNumber}
           </p>
        </div>
      </div>

      {/* Details Footer */}
      <div className="grid grid-cols-2 gap-4 border-t-4 border-black pt-6">
         <div className="space-y-1">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Weight</p>
            <p className="text-2xl font-black">{shipment.weight} KG</p>
         </div>
         <div className="text-right space-y-2">
            <div className="flex flex-wrap justify-end gap-1">
               {shipment.priorityLabels.map(label => {
                 const config = PRIORITY_CONFIG[label];
                 return (
                   <span
                     key={label}
                     className="px-2 py-1 border-2 border-black text-[10px] font-black uppercase"
                     style={{ backgroundColor: config.bg }}
                   >
                     {config.label}
                   </span>
                 );
               })}
            </div>
            <div className={`inline-block px-3 py-1 border-2 border-black text-xs font-black uppercase ${
              shipment.balanceDue > 0 ? 'bg-orange-400' : 'bg-green-400'
            }`}>
               {shipment.balanceDue > 0 ? 'Balance Due' : 'Fully Paid'}
            </div>
         </div>
      </div>

      <div className="mt-4 text-center">
         <p className="text-[8px] font-bold uppercase text-gray-400 tracking-widest">Cairo Cargo • Digital Logistics</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #shipment-tag, #shipment-tag * { visibility: visible; }
          #shipment-tag {
            position: fixed;
            left: 0;
            top: 0;
            margin: 0;
            border-width: 12px;
          }
        }
      `}} />
    </div>
  );
}
