import React from 'react';
import { Layers, Activity, RotateCcw, Clock, CheckCircle2, XCircle, Undo2 } from 'lucide-react';
import { Device, Loan } from '../types';

interface DashboardStatsProps {
  devices: Device[];
  loans: Loan[];
  currentNIMFilter: string;
  onSelectStatusFilter: (status: string | null) => void;
  selectedStatusFilter: string | null;
}

export default function DashboardStats({
  devices,
  loans,
  currentNIMFilter,
  onSelectStatusFilter,
  selectedStatusFilter,
}: DashboardStatsProps) {
  // Let's filter loans based on NIM filter if active, otherwise show stats based on all loans (or current contextual scope)
  const contextualLoans = currentNIMFilter 
    ? loans.filter(l => l.studentId === currentNIMFilter)
    : loans;

  // Calculators
  const totalAvailableDevices = devices.filter((d) => d.isAvailable).length;
  const activeLoans = contextualLoans.filter((l) => l.status === 'Approved').length;
  const totalHistory = contextualLoans.length;

  // Status counts
  const pendingCount = contextualLoans.filter((l) => l.status === 'Pending').length;
  const approvedCount = contextualLoans.filter((l) => l.status === 'Approved').length;
  const rejectedCount = contextualLoans.filter((l) => l.status === 'Rejected').length;
  const returnedCount = contextualLoans.filter((l) => l.status === 'Returned').length;

  return (
    <div className="space-y-6">
      {/* Visual Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Available Equipment Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alat Tersedia
            </span>
            <h3 className="text-3xl font-bold font-mono text-slate-800 mt-1">
              {totalAvailableDevices} <span className="text-sm font-normal text-slate-400">unit</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Siap dipinjam sekarang</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Active Loans Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pinjaman Aktif {currentNIMFilter && '(Anda)'}
            </span>
            <h3 className="text-3xl font-bold font-mono text-blue-600 mt-1">
              {activeLoans} <span className="text-sm font-normal text-blue-400">unit</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Sedang digunakan mahasiswa</p>
          </div>
          <div className="p-3.5 bg-blue-100 text-blue-700 rounded-2xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Loan History Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Riwayat Pengajuan
            </span>
            <h3 className="text-3xl font-bold font-mono text-slate-800 mt-1">
              {totalHistory} <span className="text-xs font-normal text-slate-400">transaksi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Total pengajuan terdaftar</p>
          </div>
          <div className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Status Badges filter drawer */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
          Status Pengajuan Pinjaman {currentNIMFilter && `NIM: ${currentNIMFilter}`}
        </span>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* All Filter */}
          <button
            onClick={() => onSelectStatusFilter(null)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between
              ${selectedStatusFilter === null 
                ? 'bg-blue-600 border-blue-600 text-white shadow' 
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }
            `}
          >
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">Semua</span>
            <span className="text-xl font-bold font-mono mt-1">{totalHistory}</span>
          </button>

          {/* Pending Filter */}
          <button
            onClick={() => onSelectStatusFilter('Pending')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between
              ${selectedStatusFilter === 'Pending' 
                ? 'bg-amber-500 border-amber-500 text-white shadow' 
                : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
              }
            `}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
              <Clock className={`w-3.5 h-3.5 ${selectedStatusFilter === 'Pending' ? 'text-white' : 'text-amber-500'}`} />
            </div>
            <span className="text-xl font-bold font-mono mt-1">{pendingCount}</span>
          </button>

          {/* Approved Filter */}
          <button
            onClick={() => onSelectStatusFilter('Approved')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between
              ${selectedStatusFilter === 'Approved' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow' 
                : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
              }
            `}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-medium uppercase tracking-wider">Disetujui</span>
              <CheckCircle2 className={`w-3.5 h-3.5 ${selectedStatusFilter === 'Approved' ? 'text-white' : 'text-emerald-500'}`} />
            </div>
            <span className="text-xl font-bold font-mono mt-1">{approvedCount}</span>
          </button>

          {/* Returned Filter */}
          <button
            onClick={() => onSelectStatusFilter('Returned')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between
              ${selectedStatusFilter === 'Returned' 
                ? 'bg-blue-500 border-blue-500 text-white shadow' 
                : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700'
              }
            `}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-medium uppercase tracking-wider">Kembali</span>
              <Undo2 className={`w-3.5 h-3.5 ${selectedStatusFilter === 'Returned' ? 'text-white' : 'text-blue-500'}`} />
            </div>
            <span className="text-xl font-bold font-mono mt-1">{returnedCount}</span>
          </button>

          {/* Rejected Filter */}
          <button
            onClick={() => onSelectStatusFilter('Rejected')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between
              ${selectedStatusFilter === 'Rejected' 
                ? 'bg-rose-500 border-rose-500 text-white shadow' 
                : 'bg-white border-slate-200 hover:border-rose-300 text-slate-700'
              }
            `}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-medium uppercase tracking-wider">Ditolak</span>
              <XCircle className={`w-3.5 h-3.5 ${selectedStatusFilter === 'Rejected' ? 'text-white' : 'text-rose-500'}`} />
            </div>
            <span className="text-xl font-bold font-mono mt-1">{rejectedCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
