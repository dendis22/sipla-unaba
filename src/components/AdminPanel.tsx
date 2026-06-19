import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Undo2,
  FileDown,
  Download,
  AlertTriangle,
  Lock,
  Unlock,
  Info,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Device, Loan, DeviceCategory, LoanStatus } from '../types';

interface AdminPanelProps {
  devices: Device[];
  loans: Loan[];
  onAddDevice: (newDevice: Omit<Device, 'id'>) => void;
  onEditDevice: (updatedDevice: Device) => void;
  onDeleteDevice: (id: string) => void;
  onUpdateLoanStatus: (loanId: string, status: LoanStatus, rejectionReason?: string) => void;
  onTriggerNotificationSim: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function AdminPanel({
  devices,
  loans,
  onAddDevice,
  onEditDevice,
  onDeleteDevice,
  onUpdateLoanStatus,
  onTriggerNotificationSim,
}: AdminPanelProps) {
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Device Form Edit states
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>('Infocus');
  const [deviceCondition, setDeviceCondition] = useState<Device['condition']>('Sangat Baik');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [deviceAvailable, setDeviceAvailable] = useState(true);

  // Rejection Reason Modal helper
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Tab state within Admin Panel
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'loans' | 'devices' | 'reports'>('loans');

  // Hardcoded simulated administrative password
  const SIMULATED_PASS = 'admin123';

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (adminPassword === SIMULATED_PASS) {
      setIsAdminLoggedIn(true);
    } else {
      setLoginError('Sandi admin tidak tepat! (Gunakan sandi simulasi: admin123)');
    }
  };

  const handleOpenAddDevice = () => {
    setEditingDevice(null);
    setDeviceName('');
    setDeviceCategory('Infocus');
    setDeviceCondition('Sangat Baik');
    setDeviceSerial(`SN-${Math.floor(1000 + Math.random() * 9000)}`);
    setDeviceAvailable(true);
    setIsDeviceModalOpen(true);
  };

  const handleOpenEditDevice = (dev: Device) => {
    setEditingDevice(dev);
    setDeviceName(dev.name);
    setDeviceCategory(dev.category);
    setDeviceCondition(dev.condition);
    setDeviceSerial(dev.serialNumber);
    setDeviceAvailable(dev.isAvailable);
    setIsDeviceModalOpen(true);
  };

  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    // Pick consistent card gradient color
    let imageColor = 'from-blue-500 to-indigo-600';
    if (deviceCategory === 'Speaker') {
      imageColor = editingDevice?.imageColor || 'from-teal-500 to-emerald-600';
    } else {
      imageColor = editingDevice?.imageColor || 'from-sky-500 to-blue-600';
    }

    if (editingDevice) {
      onEditDevice({
        ...editingDevice,
        name: deviceName,
        category: deviceCategory,
        condition: deviceCondition,
        serialNumber: deviceSerial,
        isAvailable: deviceAvailable,
        imageColor,
      });
      onTriggerNotificationSim(
        'Item Diubah',
        `Alat [${deviceCategory}] ${deviceName} berhasil dirubah oleh admin.`,
        'info'
      );
    } else {
      onAddDevice({
        name: deviceName,
        category: deviceCategory,
        condition: deviceCondition,
        serialNumber: deviceSerial,
        isAvailable: deviceAvailable,
        imageColor,
      });
      onTriggerNotificationSim(
        'Item Baru Ditambahkan',
        `Alat baru [${deviceCategory}] ${deviceName} telah didaftarkan dalam inventaris.`,
        'success'
      );
    }

    setIsDeviceModalOpen(false);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingLoanId || !rejectionReasonInput.trim()) return;

    onUpdateLoanStatus(rejectingLoanId, 'Rejected', rejectionReasonInput);
    
    const originalLoan = loans.find(l => l.id === rejectingLoanId);
    onTriggerNotificationSim(
      'Pengajuan Ditolak',
      `Peminjaman proyektor/speaker oleh ${originalLoan?.studentName || 'mahasiswa'} telah DITOLAK dengan alasan: ${rejectionReasonInput}`,
      'error'
    );

    setRejectingLoanId(null);
    setRejectionReasonInput('');
  };

  // Excel (CSV) Download engine
  const handleExportExcel = () => {
    // CSV structure building
    const headers = [
      'ID Pinjaman',
      'Nama Mahasiswa',
      'NIM/ID',
      'Program Studi',
      'Nomor Kontak',
      'Alat',
      'Kategori',
      'Tanggal Pinjam',
      'Tanggal Kembali',
      'Status Peminjaman',
      'Alasan Penolakan'
    ];

    const rows = loans.map(l => [
      l.id,
      `"${l.studentName.replace(/"/g, '""')}"`,
      l.studentId,
      `"${l.studyProgram}"`,
      l.mobileNumber,
      `"${l.deviceName.replace(/"/g, '""')}"`,
      l.deviceCategory,
      l.borrowDate,
      l.returnDate,
      l.status,
      `"${(l.rejectionReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_peminjaman_alat_kampus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Styled native print triggering for PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Unauthenticated view
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-bold text-xl text-slate-800">Login Administrator</h3>
          <p className="text-slate-500 text-xs mt-1">
            Gunakan panel ini untuk mengelola alat, memproses persetujuan pinjaman, & mengunduh laporan.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-1.5 leading-snug">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Sandi Administrator
            </label>
            <input
              type="password"
              placeholder="Masukkan sandi administrator..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <p className="text-[11px] text-slate-500 font-mono text-center">
              🔑 Sandi bypass demo: <strong className="text-blue-600">admin123</strong>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Unlock className="w-4 h-4" /> Masuk ke Panel Kontrol
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
      {/* Admin header rail */}
      <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-snug">Panel Utama Administrator</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sistem Peminjaman Peralatan Kampus (SIPLA)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="text-[11px] font-bold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 transition"
          >
            Keluar Mode Admin
          </button>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex border-b border-slate-100 px-5 gap-4 bg-slate-50/50 print:hidden">
        <button
          onClick={() => setActiveAdminSubTab('loans')}
          className={`py-3.5 px-1.5 font-bold text-xs border-b-2 transition-all relative cursor-pointer
            ${
              activeAdminSubTab === 'loans'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }
          `}
        >
          Persetujuan Pinjam ({loans.filter((l) => l.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveAdminSubTab('devices')}
          className={`py-3.5 px-1.5 font-bold text-xs border-b-2 transition-all relative cursor-pointer
            ${
              activeAdminSubTab === 'devices'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }
          `}
        >
          Kelola Data Alat ({devices.length})
        </button>
        <button
          onClick={() => setActiveAdminSubTab('reports')}
          className={`py-3.5 px-1.5 font-bold text-xs border-b-2 transition-all relative cursor-pointer
            ${
              activeAdminSubTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }
          `}
        >
          Laporan & Ekspor Data
        </button>
      </div>

      <div className="p-6">
        {/* SUB TAB: LOAN APPROVALS */}
        {activeAdminSubTab === 'loans' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-50/30 p-4 border border-blue-50 rounded-xl">
              <div className="flex items-start gap-2 text-blue-800">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Panduan Verifikasi</p>
                  <p className="text-blue-700/90 mt-0.5">
                    Silakan periksa nama mahasiswa, NIM, prodi, dan tanggal pesan. Setelah menyetujui, status perangkat otomatis dikunci menjadi "Sedang Dipinjam".
                  </p>
                </div>
              </div>
            </div>

            {loans.filter((l) => l.status === 'Pending').length === 0 ? (
              <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Semua Berkas Sudah Diproses</p>
                <p className="text-xs text-slate-400 mt-1">Tidak ada tiket pengajuan peminjaman baru yang mengantre.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden block">
                {loans
                  .filter((l) => l.status === 'Pending')
                  .map((loan) => (
                    <div key={loan.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                            {loan.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            loan.deviceCategory === 'Infocus' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {loan.deviceCategory}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Diajukan pada: {new Date(loan.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm">
                          {loan.studentName} ({loan.studentId}) — <span className="font-medium text-slate-500">{loan.studyProgram}</span>
                        </h4>

                        <div className="text-xs text-slate-600 space-y-1">
                          <p>
                            Alat yang dipesan:{' '}
                            <strong className="text-slate-800">{loan.deviceName}</strong>
                          </p>
                          <p className="text-slate-500">
                            Durasi Pinjam:{' '}
                            <span className="text-slate-800 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">
                              {loan.borrowDate}
                            </span>{' '}
                            s/d{' '}
                            <span className="text-slate-800 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">
                              {loan.returnDate}
                            </span>
                          </p>
                          <p>
                            Sebab Peminjaman:{' '}
                            <span className="italic text-slate-500 font-serif">&ldquo;{loan.purpose}&rdquo;</span>
                          </p>
                          {loan.permissionLetterName && (
                            <p className="font-medium text-blue-600 flex items-center gap-1">
                              📄 Surat Izin: {loan.permissionLetterName} ({loan.permissionLetterSize})
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Approval Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                        <button
                          onClick={() => {
                            setRejectingLoanId(loan.id);
                            setRejectionReasonInput('');
                          }}
                          className="bg-transparent hover:bg-rose-50 text-rose-600 text-xs px-3.5 py-2 rounded-xl font-medium border border-rose-200 hover:border-rose-300 transition flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" /> Tolak
                        </button>
                        <button
                          onClick={() => {
                            onUpdateLoanStatus(loan.id, 'Approved');
                            onTriggerNotificationSim(
                              'Peminjaman Disetujui!',
                              `Peminjaman [${loan.deviceCategory}] oleh ${loan.studentName} telah disetujui admin. QR Code siap diambil!`,
                              'success'
                            );
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1 shadow-sm hover:shadow cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Setujui
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Simulated rejection reason modal */}
            {rejectingLoanId && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-base">Alasan Penolakan</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan tentukan alasan penolakan agar mahasiswa dapat memperbaiki pengajuannya.
                  </p>

                  <form onSubmit={handleRejectSubmit} className="mt-4 space-y-3">
                    <textarea
                      rows={3}
                      required
                      placeholder="cth. Dokumen surat rekomendasi dari Kajur belum dilampirkan atau format salah..."
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      className="w-full text-slate-700 p-2.5 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none text-xs"
                    ></textarea>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setRejectingLoanId(null)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Kembali
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
                      >
                        Konfirmasi Tolak
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB TAB: MANAGE DEVICE DATA */}
        {activeAdminSubTab === 'devices' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Inventaris Alat Kampus</h4>
                <p className="text-xs text-slate-400 mt-0.5">Tambah proyektor pro, infocus baru, atau sound speaker di sini.</p>
              </div>

              <button
                onClick={handleOpenAddDevice}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 self-start shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Tambah Alat Baru
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                    <th className="p-4">ID / SN</th>
                    <th className="p-4">Nama Alat</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Kondisi</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-800 font-mono">{device.id}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SN: {device.serialNumber}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{device.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                          device.category === 'Infocus' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {device.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{device.condition}</span>
                      </td>
                      <td className="p-4">
                        {device.isAvailable ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Tersedia
                          </span>
                        ) : (
                          <span className="text-amber-500 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Dipinjam
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditDevice(device)}
                            className="p-1 px-2 hover:bg-slate-200 rounded text-slate-600 transition"
                            title="Ubah Alat"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Yakin ingin menghapus ${device.name} dari inventaris?`)) {
                                onDeleteDevice(device.id);
                                onTriggerNotificationSim(
                                  'Alat Dihapus',
                                  `${device.name} telah dieliminasi dari daftar aktif.`,
                                  'error'
                                );
                              }
                            }}
                            className="p-1 px-2 hover:bg-rose-50 rounded text-rose-500 transition"
                            title="Hapus Alat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal for Device Adding or Editing */}
            {isDeviceModalOpen && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h4 className="font-bold text-slate-800 text-sm">
                      {editingDevice ? 'Simpan Perubahan Alat' : 'Tambah Peralatan Baru'}
                    </h4>
                    <button
                      onClick={() => setIsDeviceModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveDevice} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Peralatan</label>
                      <input
                        type="text"
                        required
                        placeholder="cth. Epson EB-X06 Infocus"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        className="w-full text-xs text-slate-700 p-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori</label>
                        <select
                          value={deviceCategory}
                          onChange={(e) => setDeviceCategory(e.target.value as DeviceCategory)}
                          className="w-full text-xs text-slate-700 p-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none"
                        >
                          <option value="Infocus">Infocus (Proyektor)</option>
                          <option value="Speaker">Speaker Audio</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kondisi Alat</label>
                        <select
                          value={deviceCondition}
                          onChange={(e) => setDeviceCondition(e.target.value as Device['condition'])}
                          className="w-full text-xs text-slate-700 p-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none"
                        >
                          <option value="Sangat Baik">Sangat Baik</option>
                          <option value="Baik">Baik</option>
                          <option value="Cukup">Cukup</option>
                          <option value="Perbaikan">Sedang Dipesan/Perbaikan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Serial Number</label>
                        <input
                          type="text"
                          required
                          value={deviceSerial}
                          onChange={(e) => setDeviceSerial(e.target.value)}
                          className="w-full text-xs text-slate-700 p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Bawaan</label>
                        <select
                          value={deviceAvailable ? 'true' : 'false'}
                          onChange={(e) => setDeviceAvailable(e.target.value === 'true')}
                          className="w-full text-xs text-slate-700 p-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none"
                        >
                          <option value="true">Tersedia (Ready)</option>
                          <option value="false">Tidak Siap / Sedang Beroperasi</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsDeviceModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Simpan Alat
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB TAB: REPORTS & CONSOLE */}
        {activeAdminSubTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Arsip Riwayat Penggunaan & Peminjaman</h4>
                <p className="text-xs text-slate-400 mt-0.5">Unduh data rincian peminjaman dalam format Excel atau cetak lembar PDF.</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Ekspor Excel (CSV)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <FileDown className="w-4 h-4" /> Cetak Laporan (PDF)
                </button>
              </div>
            </div>

            {/* Loans list in reports */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                    <th className="p-4">Tanggal Pesan</th>
                    <th className="p-4">NIM / Mahasiswa</th>
                    <th className="p-4">Peralatan</th>
                    <th className="p-4">Keperluan</th>
                    <th className="p-4">Masa Pinjam</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-500">
                        {new Date(loan.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{loan.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{loan.studentId} • {loan.studyProgram}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-700">{loan.deviceName}</p>
                        <p className="text-[10px] text-slate-400">{loan.deviceCategory}</p>
                      </td>
                      <td className="p-4 text-slate-600 italic max-w-xs truncate" title={loan.purpose}>
                        &ldquo;{loan.purpose}&rdquo;
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[10px] bg-slate-100 p-1 px-1.5 rounded text-slate-700">
                          {loan.borrowDate} ~ {loan.returnDate}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">
                        {loan.status === 'Approved' && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Approved</span>
                        )}
                        {loan.status === 'Pending' && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Pending</span>
                        )}
                        {loan.status === 'Returned' && (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Returned</span>
                        )}
                        {loan.status === 'Rejected' && (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100" title={loan.rejectionReason}>Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simulated interactive test console box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h5 className="font-bold text-slate-800 text-xs text-left">Simulator Simulasi Event Lapangan (Untuk Evaluasi)</h5>
              <p className="text-[11.5px] text-slate-500 leading-snug">
                Gunakan pemicu simulasi pengembalian atau pengiriman alarm pengingat di bawah untuk memverifikasi fungsionalitas visual sistem notifikasi floating dan dashboard mahasiswa secara interaktif.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => {
                    onTriggerNotificationSim(
                      'Alarm Pengingat Kembali',
                      'Pengingat: Alat Epson EB-X06 Infocus harus dikembalikan hari ini pukul 16:00 WIB agar terhindar dari denda perpustakaan.',
                      'warning'
                    );
                    alert('Simulasi notifikasi pengingat jatuh tempo dikirim!');
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  ⚡ Kirim Pengingat Pengembalian (Deadline)
                </button>

                <button
                  onClick={() => {
                    // Find first approved loan to return
                    const approvedLoan = loans.find(l => l.status === 'Approved');
                    if (approvedLoan) {
                      onUpdateLoanStatus(approvedLoan.id, 'Returned');
                      onTriggerNotificationSim(
                        'Alat Kembali Terverifikasi',
                        `Verifikasi Sukses! ${approvedLoan.deviceName} yang dipinjam oleh ${approvedLoan.studentName} telah dicheck-in kembali dalam keadan baik.`,
                        'success'
                      );
                      alert(`Berhasil mengembalikan ${approvedLoan.deviceName} atas nama ${approvedLoan.studentName}!`);
                    } else {
                      alert('Tidak ada pinjaman berstatus "Approved" yang dapat disimulasikan sebagai kembali.');
                    }
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  ⚡ Check-In Pengembalian Cepat (Simulate Return)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Print Frame Header purely for PDF print rendering! */}
      <div className="hidden print:block font-sans p-8 space-y-4">
        <center>
          <h2 className="text-2xl font-bold">LAPORAN PEMINJAMAN ALAT MEDIA KAMPUS</h2>
          <p className="text-sm">Sistem Informasi Peminjaman Projector & Speaker - Universitas Anak Bangsa</p>
          <hr className="my-4 border-slate-400" />
        </center>
        
        <table className="w-full text-xs border border-collapse border-slate-400 text-left">
          <thead>
            <tr className="bg-slate-200 border-b border-slate-400">
              <th className="p-2 border-r border-slate-400">ID</th>
              <th className="p-2 border-r border-slate-400">Mahasiswa</th>
              <th className="p-2 border-r border-slate-400">NIM / Prodi</th>
              <th className="p-2 border-r border-slate-400">Peralatan</th>
              <th className="p-2 border-r border-slate-400">Masa Pinjam</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border-b border-slate-400">
                <td className="p-2 border-r border-slate-400">{loan.id}</td>
                <td className="p-2 border-r border-slate-400 font-bold">{loan.studentName}</td>
                <td className="p-2 border-r border-slate-400">{loan.studentId} / {loan.studyProgram}</td>
                <td className="p-2 border-r border-slate-400">{loan.deviceName} ({loan.deviceCategory})</td>
                <td className="p-2 border-r border-slate-400">{loan.borrowDate} s/d {loan.returnDate}</td>
                <td className="p-2 font-bold">{loan.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
