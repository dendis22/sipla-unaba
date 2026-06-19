import React from 'react';
import { ShieldCheck, Compass, Info, Check, AlertOctagon } from 'lucide-react';
import { Device } from '../types';

interface DeviceCardProps {
  device: Device;
  onBorrowSelected: (device: Device) => void;
  key?: string | number;
}

export default function DeviceCard({ device, onBorrowSelected }: DeviceCardProps) {
  // Return consistent SVG layout representing Projector (Infocus) or Speaker
  const renderDeviceVector = () => {
    if (device.category === 'Infocus') {
      return (
        <svg viewBox="0 0 120 80" className="w-full h-24 text-white drop-shadow-md">
          {/* Main body of Projector */}
          <rect x="15" y="25" width="90" height="35" rx="6" fill="currentColor" opacity="0.9" />
          {/* Projector Lens details */}
          <circle cx="80" cy="42" r="14" fill="#1e293b" stroke="currentColor" strokeWidth="4" />
          <circle cx="80" cy="42" r="8" fill="#38bdf8" />
          <circle cx="83" cy="39" r="3" fill="#ffffff" opacity="0.8" />
          {/* Ventilation grilles */}
          <line x1="28" y1="35" x2="48" y2="35" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="41" x2="48" y2="41" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="47" x2="40" y2="47" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          {/* Buttons on top */}
          <circle cx="30" cy="21" r="2.5" fill="#f1f5f9" />
          <circle cx="40" cy="21" r="2" fill="#94a3b8" />
          <circle cx="48" cy="21" r="2" fill="#94a3b8" />
          {/* Stand feet */}
          <line x1="25" y1="60" x2="22" y2="65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="95" y1="60" x2="98" y2="65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          {/* Status light */}
          <circle cx="102" cy="32" r="2" fill={device.isAvailable ? '#10b981' : '#f59e0b'} />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 120 80" className="w-full h-24 text-white drop-shadow-md">
          {/* Main Body of Speaker */}
          <rect x="35" y="10" width="50" height="60" rx="8" fill="currentColor" opacity="0.9" stroke="#1e293b" strokeWidth="2" />
          {/* Speaker Tweeter */}
          <circle cx="60" cy="26" r="8" fill="#1e293b" />
          <circle cx="60" cy="26" r="4" fill="#475569" />
          {/* Speaker Subwoofer */}
          <circle cx="60" cy="50" r="14" fill="#0f172a" />
          <circle cx="60" cy="50" r="10" fill="#334155" />
          <circle cx="60" cy="50" r="4" fill="#a1a1aa" opacity="0.7" />
          {/* Control dial */}
          <circle cx="45" cy="18" r="2" fill="#94a3b8" />
          <circle cx="75" cy="18" r="2" fill="#10b981" />
        </svg>
      );
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Sangat Baik':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Baik':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Cukup':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div
      id={`device-card-${device.id}`}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:border-blue-200 hover:shadow-md transition-all duration-300"
    >
      {/* Dynamic Graphic Top Section */}
      <div className={`p-6 bg-gradient-to-br ${device.imageColor} flex items-center justify-center relative overflow-hidden`}>
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:10px_10px]" />
        
        {renderDeviceVector()}
        
        <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
          {device.id}
        </span>
      </div>

      {/* Card Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                device.category === 'Infocus'
                  ? 'bg-blue-50 text-blue-700 font-mono'
                  : 'bg-purple-50 text-purple-700 font-mono'
              }`}
            >
              • {device.category}
            </span>
            <span
              className={`text-xs font-medium border px-2 py-0.5 rounded-md ${getConditionColor(
                device.condition
              )}`}
            >
              Kondisi: {device.condition}
            </span>
          </div>

          <h4 className="font-bold text-slate-800 text-base leading-snug hover:text-blue-600 transition truncate-3-lines mb-1" title={device.name}>
            {device.name}
          </h4>
          <p className="text-[11px] text-slate-400 font-mono">SN: {device.serialNumber}</p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Availability Status Badge */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Status Alat</p>
            {device.isAvailable ? (
              <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tersedia
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-semibold text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Sedang Dipinjam
              </span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onBorrowSelected(device)}
            disabled={!device.isAvailable}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all
              ${
                device.isAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {device.isAvailable ? (
              <>
                Pinjam Sekarang
              </>
            ) : (
              'Booking Penuh'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
