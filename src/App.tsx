import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Layers,
  ClipboardList,
  Activity,
  Settings,
  HelpCircle,
  Home,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Info
} from 'lucide-react';
import { Device, Loan, AppNotification, LoanStatus } from './types';
import { INITIAL_DEVICES, INITIAL_LOANS } from './data';
import DeviceCard from './components/DeviceCard';
import LoanForm from './components/LoanForm';
import DashboardStats from './components/DashboardStats';
import StudentLoanList from './components/StudentLoanList';
import ScheduleCalendar from './components/ScheduleCalendar';
import AdminPanel from './components/AdminPanel';
import NotificationCenter from './components/NotificationCenter';
import PasscodeGate from './components/PasscodeGate';

export default function App() {
  // 1. Core State persisted in LocalStorage for amazing fidelity
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('sipla_devices');
    return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('sipla_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('sipla_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'n-1',
        title: 'Sistem Aktif & Terlindungi',
        message: 'Selamat datang di SIPLA. Gunakan portal ini untuk memesan proyektor dan speaker dengan efisien.',
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: 'n-2',
        title: 'Pengingat Batas Pengembalian',
        message: 'Info: Peminjaman Speaker Polytron atas nama Ahmad Faisal dijadwalkan kembali hari ini.',
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
      }
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('sipla_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('sipla_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('sipla_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'apply' | 'dashboard' | 'admin'>('home');
  const [isPasscodeVerified, setIsPasscodeVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('sipla_passcode_verified') === 'true';
  });

  // 3. Global Filters and Interactions
  const [searchCatalogQuery, setSearchCatalogQuery] = useState('');
  const [categoryCatalogFilter, setCategoryCatalogFilter] = useState<'All' | 'Infocus' | 'Speaker'>('All');
  const [statusCatalogFilter, setStatusCatalogFilter] = useState<'All' | 'Available' | 'Loaned'>('All');
  
  // Selected device context from catalog for auto-fill quick applying
  const [selectedDeviceOnCatalog, setSelectedDeviceOnCatalog] = useState<Device | null>(null);

  // Student student lookup filter
  const [studentSearchNIM, setStudentSearchNIM] = useState('');
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<string | null>(null);

  // UI state for notifications drawer
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Helper toaster trigger
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: string } | null>(null);

  const triggerToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const toastId = Math.random().toString();
    setActiveToast({ id: toastId, title, message, type });
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setActiveToast((prev) => (prev?.id === toastId ? null : prev));
    }, 4500);
  };

  // 4. Client state modification triggers callback
  const handleAddDevice = (newDeviceInput: Omit<Device, 'id'>) => {
    const newId = `DEV-${newDeviceInput.category === 'Infocus' ? 'INF' : 'SPK'}-${String(devices.length + 1).padStart(3, '0')}`;
    const newDev: Device = {
      ...newDeviceInput,
      id: newId,
    };
    setDevices((prev) => [newDev, ...prev]);
    triggerToast('Alat Ditambahkan', `${newDev.name} berhasil didaftarkan.`, 'success');
  };

  const handleEditDevice = (updatedDevice: Device) => {
    setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
    triggerToast('Data Diubah', 'Spesifikasi peralatan berhasil diperbarui.', 'info');
  };

  const handleDeleteDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    triggerToast('Alat Dihapus', 'Peralatan telah ditarik dari sirkulasi aktif.', 'error');
  };

  const handleAddLoan = (newLoanData: Omit<Loan, 'id' | 'status' | 'createdAt' | 'qrCodeValue'>) => {
    const newId = `L-2026-${String(loans.length + 1).padStart(3, '0')}`;
    const newLoan: Loan = {
      ...newLoanData,
      id: newId,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      qrCodeValue: `QR-SIPLA-${newId}-${newLoanData.studentId}-${newLoanData.deviceId}`,
    };

    setLoans((prev) => [newLoan, ...prev]);

    // Update specific device availability status so booking is locked
    setDevices((prev) =>
      prev.map((d) => (d.id === newLoanData.deviceId ? { ...d, isAvailable: false } : d))
    );

    // Filter to new NIM automatically in student dashboard
    setStudentSearchNIM(newLoanData.studentId);

    // Push Notification
    const newNotif: AppNotification = {
      id: `notif-${Math.random()}`,
      title: 'Tiket Pengajuan Baru',
      message: `Mahasiswa ${newLoanData.studentName} mengajukan pinjam ${newLoanData.deviceName}. Tanggal: ${newLoanData.borrowDate}.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    triggerToast(
      'Pengajuan Berhasil',
      'Dokumen dikirim ke antrean admin. Cek dashboard mahasiswa Anda.',
      'success'
    );
  };

  const handleUpdateLoanStatus = (loanId: string, status: LoanStatus, rejectionReason?: string) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          return { ...l, status, rejectionReason };
        }
        return l;
      })
    );

    // If loan is returned or rejected, restore device availability
    const targetLoan = loans.find((l) => l.id === loanId);
    if (targetLoan && (status === 'Returned' || status === 'Rejected')) {
      setDevices((prev) =>
        prev.map((d) => (d.id === targetLoan.deviceId ? { ...d, isAvailable: true } : d))
      );
    }

    // Trigger Notification Event
    const statusTextIndo =
      status === 'Approved'
        ? 'DISETUJUI'
        : status === 'Rejected'
        ? 'DITOLAK'
        : 'TELAH DIKEMBALIKAN';

    const newNotif: AppNotification = {
      id: `notif-${Math.random()}`,
      title: `Status Pinjaman: ${statusTextIndo}`,
      message: `Pengajuan ${targetLoan?.id} (${targetLoan?.deviceName}) telah diubah oleh administrasi kampus.`,
      type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    triggerToast(
      'Status Terupdate',
      `Tiket ${loanId} berhasil diproses menjadi ${statusTextIndo}.`,
      status === 'Approved' ? 'success' : 'info'
    );
  };

  // Quick action from catalog -> prefill form and switch tab
  const handleBorrowNowShortcut = (device: Device) => {
    setSelectedDeviceOnCatalog(device);
    setActiveTab('apply');
    triggerToast('Alat Terpilih', `${device.name} otomatis dimasukkan ke formulir pemesanan.`, 'info');
  };

  // Filter Catalog devices computed values
  const filteredCatalogDevices = devices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchCatalogQuery.toLowerCase()) ||
                          device.id.toLowerCase().includes(searchCatalogQuery.toLowerCase()) ||
                          device.serialNumber.toLowerCase().includes(searchCatalogQuery.toLowerCase());
    
    const matchesCategory = categoryCatalogFilter === 'All' ? true : device.category === categoryCatalogFilter;
    
    const matchesAvailability = statusCatalogFilter === 'All'
      ? true
      : statusCatalogFilter === 'Available'
      ? device.isAvailable
      : !device.isAvailable;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div id="full-app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      
      {/* GLOBAL TOAST FLOATER */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-[999] max-w-sm w-full bg-white border border-slate-100 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            activeToast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
            activeToast.type === 'error' ? 'bg-rose-50 text-rose-500' :
            activeToast.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">{activeToast.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{activeToast.message}</p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-[100] bg-white border-b border-slate-100 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-100 group-hover:bg-blue-700 transition duration-200">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-sm tracking-tight leading-none">SIPLA UNABA</h1>
              <p className="text-[9px] text-blue-600 font-bold tracking-wider uppercase mt-0.5">Universitas Anak Bangsa</p>
            </div>
          </div>

          {/* Center Tabs Navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer
                ${activeTab === 'home' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/55'}
              `}
            >
              <Home className="w-3.5 h-3.5" /> Beranda
            </button>
            <button
              onClick={() => {
                setActiveTab('catalog');
                setSelectedDeviceOnCatalog(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer
                ${activeTab === 'catalog' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/55'}
              `}
            >
              <Layers className="w-3.5 h-3.5" /> Katalog Alat
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer
                ${activeTab === 'apply' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/55'}
              `}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Ajukan Pinjaman
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer
                ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/55'}
              `}
            >
              <Activity className="w-3.5 h-3.5" /> Dashboard Mahasiswa
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer
                ${activeTab === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/55'}
              `}
            >
              <Settings className="w-3.5 h-3.5" /> Admin Panel
            </button>
          </nav>

          {/* Right utilities box */}
          <div className="flex items-center gap-3">
            
            {/* Notification bell button with count badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition relative cursor-pointer
                    ${isNotificationsOpen ? 'bg-slate-100 text-blue-600' : 'bg-white'}
                `}
                title="Sistem Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white animate-bounce">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* Float drawer */}
              {isNotificationsOpen && (
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={(id) => {
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                    );
                    triggerToast('Tersimpan', 'Notifikasi ditandai telah dibaca.', 'info');
                  }}
                  onClearAll={() => {
                    setNotifications([]);
                    triggerToast('Dibersihkan', 'Arsip notifikasi dikosongkan.', 'info');
                  }}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              )}
            </div>

            {/* Quick Apply shortcut in Header bar */}
            <button
              onClick={() => setActiveTab('apply')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-100 hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" /> Pinjam Alat
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tab rails (Visible on smaller screens) */}
        <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-white p-1 text-slate-500">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold ${activeTab === 'home' ? 'text-blue-600' : 'hover:text-slate-800'}`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold ${activeTab === 'catalog' ? 'text-blue-600' : 'hover:text-slate-800'}`}
          >
            <Layers className="w-4 h-4" />
            <span>Katalog</span>
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold ${activeTab === 'apply' ? 'text-blue-600' : 'hover:text-slate-800'}`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Ajukan</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-blue-600' : 'hover:text-slate-800'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold ${activeTab === 'admin' ? 'text-slate-900' : 'hover:text-slate-800'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>
      </header>

      {/* CORE CONTENT LAYOUT STAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Beautiful Minimalist Academic Blue and White Hero Header */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-xl shadow-blue-900/10">
              {/* Abstract structural graphic elements */}
              <div className="absolute top-0 right-0 w-[45%] h-full bg-cover opacity-15 hidden md:block bg-no-repeat pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
              
              <div className="relative max-w-2xl space-y-5 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/30 backdrop-blur-md rounded-full text-xs font-bold text-blue-200 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SISTEM AKTIF & TERBUKA UNTUK MAHASISWA
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
                  SIPLA Universitas Anak Bangsa
                </h2>
                <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-light">
                  Pinjam infocus dan speaker pro secara cepat, mudah, dan transparan untuk mendukung kelancaran kegiatan akademik, organisasi, serta kuliah tamu Anda di seluruh fakultas Universitas Anak Bangsa.
                </p>

                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="bg-white hover:bg-slate-100 text-blue-800 font-bold text-xs px-6 py-3.5 rounded-xl transition shadow-lg active:scale-95 flex items-center gap-1"
                  >
                    Ajukan Peminjaman <ArrowRight className="w-4 h-4 text-blue-700" />
                  </button>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="bg-blue-600/50 hover:bg-blue-600/80 border border-blue-400/40 font-semibold text-xs px-6 py-3.5 rounded-xl text-white transition"
                  >
                    Lihat Katalog Alat
                  </button>
                </div>
              </div>
            </div>

            {/* Micro statistic panel displaying instantly available items */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="p-4 border-r border-slate-50 last:border-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Infocus</span>
                <p className="text-2xl font-bold font-mono text-slate-800 mt-1">
                  {devices.filter(d => d.category === 'Infocus').length} <span className="text-xs text-slate-400">unit</span>
                </p>
              </div>
              <div className="p-4 border-r border-slate-50 last:border-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Speaker</span>
                <p className="text-2xl font-bold font-mono text-slate-800 mt-1">
                  {devices.filter(d => d.category === 'Speaker').length} <span className="text-xs text-slate-400">unit</span>
                </p>
              </div>
              <div className="p-4 border-r border-slate-50 last:border-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Statistik Tersedia</span>
                <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                  {devices.filter(d => d.isAvailable).length} <span className="text-xs text-slate-400">Siap</span>
                </p>
              </div>
              <div className="p-4 last:border-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sedang Beroperasi</span>
                <p className="text-2xl font-bold font-mono text-amber-500 mt-1">
                  {devices.filter(d => !d.isAvailable).length} <span className="text-xs text-slate-400">Aktif</span>
                </p>
              </div>
            </div>

            {/* Embedded Calendar Schedule Tool Widget */}
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg">Kalender Reservasi Dan Pemakaian</h4>
                <p className="text-xs text-slate-400">Cari tahu kecocokan jadwal perhelatan Anda dan sirkulasi alat kampus kami.</p>
              </div>
              <ScheduleCalendar loans={loans} />
            </div>

            {/* Core Features value props */}
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg">Mengapa Memilih Portal SIPLA?</h4>
                <p className="text-xs text-slate-400">Didukung efisiensi birokrasi kampus modern serba hemat waktu.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm">Kurang dari 2 Menit</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pengajuan paperless, cukup pilih alat, masukkan data diri dan surat rekomendasi fakultas, langsung terkirim.
                  </p>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm">Notifikasi Pengingat</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sistem otomatis mengirimi alarm pengembalian agar Anda terhindar dari pemblokiran status atau denda keterlambatan.
                  </p>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm">Pickup Tanpa Dokumen Fisik</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instan pickup. Cukup bawa berkas QR Code digital yang terverifikasi ke unit laboratorium untuk ditransfer langsung.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick footer */}
            <div className="bg-slate-100 rounded-2xl p-4 text-center text-xs text-slate-500 border border-slate-200">
              Kampus Equipment Loan System (SIPLA) © 2026 Universitas Anak Bangsa. Dikembangkan khusus untuk efesiensi kerja kemahasiswaan.
            </div>
          </div>
        )}

        {/* VIEW: CATALOG SCREEN */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Catalog header title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-2xl text-slate-800">Katalog Peralatan Aktif</h3>
                <p className="text-xs text-slate-400 mt-1">Cari dan temukan kualitas proyektor LCD infocus dan speaker portable audio.</p>
              </div>

              {/* Counter status label */}
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                Menampilkan {filteredCatalogDevices.length} dari {devices.length} Peralatan Kampus
              </span>
            </div>

            {/* Search Filter Controls bar */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Type query search */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Cari Nama atau Kata Kunci
                </label>
                <input
                  type="text"
                  placeholder="Cari epson, jbl, sony, serial number..."
                  value={searchCatalogQuery}
                  onChange={(e) => setSearchCatalogQuery(e.target.value)}
                  className="w-full text-xs text-slate-600 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Categorize Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Kategori Alat
                </label>
                <select
                  value={categoryCatalogFilter}
                  onChange={(e) => setCategoryCatalogFilter(e.target.value as any)}
                  className="w-full text-xs text-slate-650 p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Infocus">Infocus (Proyektor)</option>
                  <option value="Speaker">Speaker Audio</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Status Ketersediaan
                </label>
                <select
                  value={statusCatalogFilter}
                  onChange={(e) => setStatusCatalogFilter(e.target.value as any)}
                  className="w-full text-xs text-slate-650 p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
                >
                  <option value="All">Semua Ketersediaan</option>
                  <option value="Available">Tersedia (Ready)</option>
                  <option value="Loaned">Sedang Habis Dipinjam</option>
                </select>
              </div>
            </div>

            {/* Zero Results View */}
            {filteredCatalogDevices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">Peralatan Tidak Ditemukan</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Harap periksa kecocokan kata kunci pencarian Anda atau rubah pengaturan filter di atas.
                </p>
                <button
                  onClick={() => {
                    setSearchCatalogQuery('');
                    setCategoryCatalogFilter('All');
                    setStatusCatalogFilter('All');
                  }}
                  className="mt-4 bg-slate-100 text-slate-600 font-semibold text-xs px-4 py-2 rounded-xl"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              /* Grid Layout devices */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCatalogDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onBorrowSelected={handleBorrowNowShortcut}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: LAUNCH LOAN APPLYING FORM */}
        {activeTab === 'apply' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-2xl text-slate-800 text-left">Pusat Pengajuan Peminjaman</h3>
                <p className="text-xs text-slate-400 mt-1 mt-1 text-left">
                  Lengkapi dan jadwalkan tanggal pinjam Anda. Gunakan tombol "Pinjam Sekarang" di katalog untuk memilih alat proyektor atau speaker pilihan secara cepat.
                </p>
              </div>
              {isPasscodeVerified && (
                <div id="passcode-verified-badge" className="flex items-center gap-1.5 self-start sm:self-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Akses Terverifikasi
                </div>
              )}
            </div>

            {!isPasscodeVerified ? (
              <PasscodeGate
                onSuccess={() => {
                  setIsPasscodeVerified(true);
                  sessionStorage.setItem('sipla_passcode_verified', 'true');
                }}
              />
            ) : (
              <LoanForm
                devices={devices}
                selectedDeviceOnCatalog={selectedDeviceOnCatalog}
                onSubmitLoan={(loanPayload) => handleAddLoan(loanPayload)}
                onClearSelectedDevice={() => setSelectedDeviceOnCatalog(null)}
              />
            )}
          </div>
        )}

        {/* VIEW: STUDENT ACTIONS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="font-extrabold text-2xl text-slate-800">Dashboard Kemahasiswaan & Riwayat</h3>
              <p className="text-xs text-slate-400 mt-1">Lacak tiket pinjaman Anda, dapatkan QR Code pickup, & pantau verifikasi dari tim administrasi.</p>
            </div>

            {/* Metric counters */}
            <DashboardStats
              devices={devices}
              loans={loans}
              currentNIMFilter={studentSearchNIM}
              onSelectStatusFilter={(status) => setDashboardStatusFilter(status)}
              selectedStatusFilter={dashboardStatusFilter}
            />

            {/* Student list container */}
            <StudentLoanList
              loans={loans}
              searchNIM={studentSearchNIM}
              onSearchNIMChange={(val) => setStudentSearchNIM(val)}
              selectedStatusFilter={dashboardStatusFilter}
            />

            {/* Quick help context box */}
            <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 text-left text-xs text-slate-600 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Butuh Bantuan Pickup?</p>
                <p className="text-slate-500 mt-1">
                  Jika status pinjaman Anda telah berubah menjadi <strong>"Disetujui"</strong>, Anda dapat segera menekan tombol <strong>"Ambil Alat"</strong> untuk memunculkan tiket kode QR unik Anda. Tunjukkan tiket tersebut ke pengawas laboran guna serah terima langsung.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ADMIN PANEL VIEW */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="font-extrabold text-2xl text-slate-800">Portal Keamanan Administrasi</h3>
              <p className="text-xs text-slate-400 mt-1 text-left">Fakultas mengawasi jalannya registrasi sirkulasi secara real-time.</p>
            </div>

            <AdminPanel
              devices={devices}
              loans={loans}
              onAddDevice={handleAddDevice}
              onEditDevice={handleEditDevice}
              onDeleteDevice={handleDeleteDevice}
              onUpdateLoanStatus={handleUpdateLoanStatus}
              onTriggerNotificationSim={(title, message, type) => {
                const newNotif: AppNotification = {
                  id: `notif-${Math.random()}`,
                  title,
                  message,
                  type,
                  timestamp: new Date().toISOString(),
                  read: false,
                };
                setNotifications((prev) => [newNotif, ...prev]);
                triggerToast(title, message, type);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
