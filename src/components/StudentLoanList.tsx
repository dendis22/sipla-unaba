import React, { useState } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  ShieldCheck,
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
  const [selectedNIMVerification, setSelectedNIMVerification] = useState<Loan | null>(null);
  const [enteredNIM, setEnteredNIM] = useState('');
  const [isNIMVerified, setIsNIMVerified] = useState(false);
  const [nimError, setNimError] = useState(false);

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

  const handleVerifyNIM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNIMVerification) return;

    if (enteredNIM.trim() === selectedNIMVerification.studentId) {
      setIsNIMVerified(true);
      setNimError(false);
    } else {
      setNimError(true);
    }
  };

  const closeVerification = () => {
    setSelectedNIMVerification(null);
    setEnteredNIM('');
    setIsNIMVerified(false);
    setNimError(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Header filter options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Status Pengajuan & Riwayat Pinjaman Anda</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Ketik NIM Anda untuk melihat agenda aktif, tindak lanjut, & verifikasi NIM.
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
                    onClick={() => {
                      setSelectedNIMVerification(loan);
                      setIsNIMVerified(false);
                      setNimError(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:shadow active:scale-95 transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Ambil Alat (Verifikasi NIM)
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

      {/* Interactive NIM verification pop-up card */}
      {selectedNIMVerification && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 relative">
            <button
              onClick={closeVerification}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 bg-slate-100 hover:bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>

            {!isNIMVerified ? (
              <form onSubmit={handleVerifyNIM} className="space-y-4">
                <span className="text-[11px] bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                  Verifikasi Keamanan NIM
                </span>

                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600 mt-2">
                  <UserCheck className="w-6 h-6" />
                </div>

                <h4 className="font-bold text-slate-800 text-base leading-snug">
                  Verifikasi Identitas Peminjam
                </h4>
                <p className="text-xs text-slate-500">
                  Untuk mengonfirmasi pengambilan <strong>{selectedNIMVerification.deviceName}</strong>, silakan verifikasi NIM peminjam.
                </p>

                <div className="text-left space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nomor Induk Mahasiswa (NIM)</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan NIM Peminjam"
                    value={enteredNIM}
                    onChange={(e) => {
                      setEnteredNIM(e.target.value);
                      if (nimError) setNimError(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-all ${
                      nimError 
                        ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-1 focus:ring-rose-500' 
                        : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  {nimError && (
                    <p className="text-[11px] text-rose-600 font-medium">NIM tidak sesuai dengan nama peminjam!</p>
                  )}
                </div>

                {/* Helper hint for easy demo/testing */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 text-left text-[10px] text-amber-805">
                  <span className="font-bold block">Petunjuk Pengujian:</span>
                  Gunakan NIM mahasiswa ini: <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 font-bold">{selectedNIMVerification.studentId}</code>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-colors"
                >
                  Verifikasi & Tampilkan Petunjuk
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                  NIM Terverifikasi
                </span>

                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600 mt-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <h4 className="font-bold text-slate-800 text-base leading-snug">
                  Verifikasi Berhasil!
                </h4>
                
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[11px] text-slate-600 text-left space-y-1">
                  <div className="flex justify-between border-b pb-1 border-slate-100">
                    <span className="text-slate-400">Peminjam</span>
                    <span className="font-bold text-slate-850">{selectedNIMVerification.studentName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 border-slate-100">
                    <span className="text-slate-400">NIM</span>
                    <span className="font-mono font-bold text-slate-850">{selectedNIMVerification.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Peralatan</span>
                    <span className="font-bold text-slate-850">{selectedNIMVerification.deviceName}</span>
                  </div>
                </div>

                {/* Pickup Instructions list */}
                <div className="text-left bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-2 text-xs text-slate-600">
                  <span className="font-bold text-blue-800 text-xs block">📍 Lokasi Pengambilan Alat:</span>
                  <p className="leading-snug">
                    Silakan datang ke <strong>Ruang Media & Laboratorium Terpadu, Gedung C Lantai 2</strong>.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                    <li>Bawa dan tunjukkan <strong>Kartu Tanda Mahasiswa (KTM) {selectedNIMVerification.studentName}</strong> asli Anda.</li>
                    <li>Sebutkan kepada petugas laboran bahwa NIM Anda telah terverifikasi secara digital.</li>
                    <li>Batas waktu pengambilan: maks. tanggal <strong>{selectedNIMVerification.borrowDate}</strong>.</li>
                  </ul>
                </div>

                <button
                  onClick={closeVerification}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-colors"
                >
                  Selesai & Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
