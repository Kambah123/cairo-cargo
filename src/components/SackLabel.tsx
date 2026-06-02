import { QRCodeSVG } from 'qrcode.react';
import type { Sack } from '@/types';
import { DESTINATION_COLORS } from '@/types';

interface SackLabelProps {
  sack: Sack;
}

export default function SackLabel({ sack }: SackLabelProps) {
  const color = DESTINATION_COLORS[sack.destination];

  return (
    <div className="print-sticker w-[4in] h-[6in] bg-white p-6 flex flex-col items-center border border-gray-200">
      <div className="w-full h-8 mb-4" style={{ backgroundColor: color }} />

      <div className="text-center mb-6">
        <h2 className="text-4xl font-black tracking-tighter uppercase mb-1">{sack.destination}</h2>
        <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Master Sack Label</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full border-y-4 border-black py-8 my-4">
        <QRCodeSVG value={sack.id} size={180} level="H" />
        <p className="font-mono text-2xl font-bold tracking-[0.2em]">{sack.id}</p>
      </div>

      <div className="w-full grid grid-cols-2 gap-4 mt-auto">
        <div className="border-2 border-black p-4 text-center rounded-xl">
          <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Parcel Count</p>
          <p className="text-3xl font-black">{sack.parcelCount}</p>
        </div>
        <div className="border-2 border-black p-4 text-center rounded-xl">
          <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Total Weight</p>
          <p className="text-3xl font-black">{sack.totalWeight.toFixed(1)}kg</p>
        </div>
      </div>

      <div className="w-full mt-6 flex justify-between items-end">
        <p className="text-[10px] font-mono text-gray-400">{new Date(sack.createdAt).toLocaleString()}</p>
        <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-black" />
            <div className="w-6 h-6 bg-black rounded-full" />
        </div>
      </div>
    </div>
  );
}
