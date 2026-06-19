import React, { useState } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  Calendar,
  Phone,
  User,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Loan, LoanStatus } from '../types';

interface StudentLoanListProps {
  loans: Loan[];
  searchNIM: string;
  onSearchNIMChange: (val: string) => void;
  selectedStatusFilter: string | null;
}

export default function StudentLoanList({
  loans,
  searchNIM,
  onSearchNIMChange,
  selectedStatusFilter,
}: StudentLoanListProps) {
  const [selectedQRVerification, setSelectedQRVerification] = useState<Loan | null>(null);

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    // 1. Filter by student ID (NIM) search
    const matchesNIM = searchNIM
      ? loan.studentId.toLowerCase().includes(searchNIM.toLowerCase())
      : true;

    // 2. Filter by status badge click
    const matchesStatus = selectedStatusFilter
      ? loan.status === selectedStatusFilter
      : true;

    return matchesNIM && matchesStatus;
  });

  const getStatusStyle = (status: LoanStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Returned':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  const getStatusLabel = (status: LoanStatus) => {
    switch (status) {
      case 'Pending':
        return 'Menunggu Persetujuan';
      case 'Approved':
        return 'Disetujui (Siap Diambil)';
      case 'Returned':
        return 'Sudah Dikembalikan';
      case 'Rejected':
        return 'Ditolak';
    }
  };

  const currentActiveQRValue = selectedQRVerification
    ? `SIPLA-${selectedQRVerification.id}-${selectedQRVerification.studentId}-${selectedQRVerification.deviceId}`
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Header filter options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Status Pengajuan & Riwayat Pinjaman Anda</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Ketik NIM Anda untuk melihat agenda aktif, tindak lanjut, & QR Code verifikasi.
          </p>
        </div>

        {/* NIM Search Tool */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari NIM Anda... (cth. 10123045)"
            value={searchNIM}
            onChange={(e) => onSearchNIMChange(e.target.value.replace(/\D/g, ''))}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 bg-slate-50/50"
          />
        </div>
      </div>

      {/* No Loans available view */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 text-sm font-semibold">Data Pengajuan Tidak Ditemukan</p>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
            {searchNIM 
              ? `Belum terdengar pengajuan untuk NIM "${searchNIM}" dengan filter status terpilih.` 
              : 'Silakan isi formulir pengajuan peminjaman alat di bawah untuk memulai.'}
          </p>
          {searchNIM && (
            <button
              onClick={() => onSearchNIMChange('')}
              className="mt-3 text-xs text-blue-600 underline font-medium"
            >
              Tampilkan Semua Riwayat
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className="border border-slate-100 rounded-2xl p-5 hover:indigo-glow hover:border-blue-100 shadow-sm hover:shadow transition-all duration-300 flex flex-col justify-between bg-white relative overflow-hidden"
              id={`loan-card-${loan.id}`}
            >
              {/* Highlight background strip for approved loans ready to pick up */}
              {loan.status === 'Approved' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
              )}

              <div>
                {/* Header block with badges */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-mono font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    ID: {loan.id}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${getStatusStyle(
                      loan.status
                    )}`}
                  >
                    {getStatusLabel(loan.status)}
                  </span>
                </div>

                {/* Device Title & Details */}
                <h5 className="font-bold text-slate-800 text-sm leading-snug">{loan.deviceName}</h5>
                <p className="text-xs text-blue-600 font-mono mt-0.5">{loan.deviceCategory}</p>

                {/* Student specific fields */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate font-medium text-slate-700">{loan.studentName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-slate-700 text-[10px]">{loan.borrowDate}{loan.borrowTime ? ` (${loan.borrowTime})` : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">NIM:</span>
                    <span className="font-mono text-slate-700 font-semibold">{loan.studentId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Hingga:</span>
                    <span className="font-mono text-[10px] font-bold text-blue-650">
                      {loan.returnDate}{loan.returnTime ? ` (${loan.returnTime})` : ''}
                    </span>
                  </div>
                </div>

                {/* Purpose of borrowing info */}
                <div className="mt-3 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 leading-snug">
                  <span className="font-semibold text-slate-700 text-[10px] block mb-0.5">Keperluan:</span>
                  &ldquo;{loan.purpose}&rdquo;
                </div>

                {/* Print file upload info if present */}
                {loan.permissionLetterName && (
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Surat Izin: {loan.permissionLetterName} ({loan.permissionLetterSize})</span>
                  </div>
                )}

                {/* Rejection Feedback if applicable */}
                {loan.status === 'Rejected' && loan.rejectionReason && (
                  <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div>
                      <span className="font-bold">Alasan Penolakan:</span>
                      <p className="mt-0.5 text-[11px] text-rose-700 leading-relaxed font-serif italic">&ldquo;{loan.rejectionReason}&rdquo;</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pinpoint Checkin actions for pickup codes */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Diajukan: {new Date(loan.createdAt).toLocaleDateString('id-ID')}
                </span>

                {loan.status === 'Approved' ? (
                  <button
                    onClick={() => setSelectedQRVerification(loan)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:shadow active:scale-95 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Ambil Alat (QR Code)
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">
                    {loan.status === 'Pending' ? 'Menunggu verifikasi' : loan.status === 'Returned' ? 'Selesai & Dikembalikan' : 'Dibatalkan/Ditolak'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code pickup verification pop-up card mockup */}
      {selectedQRVerification && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 relative">
            <button
              onClick={() => setSelectedQRVerification(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 bg-slate-100 hover:bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>

            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              QR Code Verifikasi
            </span>

            <h4 className="font-bold text-slate-800 text-lg mt-3 leading-snug">
              {selectedQRVerification.deviceName}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Atas Nama: <strong className="text-slate-850 font-bold">{selectedQRVerification.studentName}</strong> ({selectedQRVerification.studentId})
            </p>

            {/* Custom high contrast vectorized QR Code representation */}
            <div className="my-6 bg-slate-50 p-4 rounded-2xl inline-block border border-slate-100">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto text-slate-900">
                  {/* Outer Frame Corner 1 */}
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="11" width="13" height="13" fill="currentColor" />

                  {/* Outer Frame Corner 2 */}
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="76" y="11" width="13" height="13" fill="currentColor" />

                  {/* Outer Frame Corner 3 */}
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="76" width="13" height="13" fill="currentColor" />

                  {/* Small QR anchor alignment pattern */}
                  <rect x="75" y="75" width="10" height="10" fill="currentColor" />

                  {/* Matrix codes random mockup */}
                  <rect x="35" y="5" width="4" height="4" fill="currentColor" />
                  <rect x="45" y="8" width="8" height="4" fill="currentColor" />
                  <rect x="38" y="18" width="4" height="8" fill="currentColor" />
                  <rect x="58" y="5" width="4" height="4" fill="currentColor" />

                  <rect x="35" y="32" width="12" height="4" fill="currentColor" />
                  <rect x="55" y="28" width="4" height="12" fill="currentColor" />
                  <rect x="70" y="35" width="16" height="4" fill="currentColor" />
                  <rect x="80" y="45" width="4" height="8" fill="currentColor" />

                  <rect x="15" y="40" width="8" height="4" fill="currentColor" />
                  <rect x="5" y="48" width="12" height="4" fill="currentColor" />
                  <rect x="24" y="52" width="4" height="12" fill="currentColor" />

                  <rect x="38" y="48" width="12" height="12" fill="currentColor" />
                  <rect x="55" y="50" width="8" height="4" fill="currentColor" />
                  <rect x="65" y="58" width="4" height="12" fill="currentColor" />

                  <rect x="35" y="70" width="4" height="20" fill="currentColor" />
                  <rect x="45" y="75" width="16" height="4" fill="currentColor" />
                  <rect x="48" y="85" width="12" height="8" fill="currentColor" />

                  <rect x="85" y="60" width="10" height="4" fill="currentColor" />
                  <rect x="90" y="70" width="4" height="4" fill="currentColor" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-wider">
                CODE: {currentActiveQRValue}
              </p>
            </div>

            {/* Pickup Instructions list */}
            <div className="text-left bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-2 text-xs text-slate-600">
              <span className="font-bold text-blue-800 text-xs block">📍 Lokasi Pengambilan Alat:</span>
              <p className="leading-snug">
                Silakan datang ke <strong>Ruang Media & Laboratorium Terpadu, Gedung C Lantai 2</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                <li>Bawa dan tunjukkan <strong>Kartu Tanda Mahasiswa (KTM)</strong> Anda.</li>
                <li>Tunjukkan layar berisi QR Code verifikasi ini ke petugas.</li>
                <li>Batas waktu pengambilan: maks. tanggal <strong>{selectedQRVerification.borrowDate}</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
