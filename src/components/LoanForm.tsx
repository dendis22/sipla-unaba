import React, { useState, useEffect, useRef } from 'react';
import { FileUp, Trash2, Calendar, ClipboardList, AlertCircle, FileText, Check } from 'lucide-react';
import { Device, Loan } from '../types';
import { STUDY_PROGRAMS } from '../data';

interface LoanFormProps {
  devices: Device[];
  selectedDeviceOnCatalog: Device | null;
  onSubmitLoan: (formData: Omit<Loan, 'id' | 'status' | 'createdAt' | 'qrCodeValue'> & { permissionLetter?: File }) => void;
  onClearSelectedDevice: () => void;
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRoundedTimeAndReturn = () => {
  const d = new Date();
  let minutes = d.getMinutes();
  let hours = d.getHours();

  if (minutes > 0 && minutes <= 15) {
    minutes = 15;
  } else if (minutes > 15 && minutes <= 30) {
    minutes = 30;
  } else if (minutes > 30 && minutes <= 45) {
    minutes = 45;
  } else if (minutes > 45) {
    minutes = 0;
    hours = (hours + 1) % 24;
  } else {
    minutes = 0;
  }

  const startHourStr = String(hours).padStart(2, '0');
  const startMinStr = String(minutes).padStart(2, '0');
  const borrowTime = `${startHourStr}:${startMinStr}`;

  const endHours = (hours + 2) % 24;
  const endHourStr = String(endHours).padStart(2, '0');
  const returnTime = `${endHourStr}:${startMinStr}`;

  return { borrowTime, returnTime };
};

export default function LoanForm({
  devices,
  selectedDeviceOnCatalog,
  onSubmitLoan,
  onClearSelectedDevice,
}: LoanFormProps) {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const today = getTodayString();
  const { borrowTime: initBorrow, returnTime: initReturn } = getRoundedTimeAndReturn();

  const [borrowDate, setBorrowDate] = useState(today);
  const [borrowTime, setBorrowTime] = useState(initBorrow);
  const [returnDate, setReturnDate] = useState(today);
  const [returnTime, setReturnTime] = useState(initReturn);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleBorrowTimeChange = (newTime: string) => {
    setBorrowTime(newTime);
    const [h, m] = newTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const returnH = (h + 2) % 24;
      const returnHStr = String(returnH).padStart(2, '0');
      const returnMStr = String(m).padStart(2, '0');
      setReturnTime(`${returnHStr}:${returnMStr}`);
    }
  };

  // Permission letter upload state
  const [permissionLetter, setPermissionLetter] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successApply, setSuccessApply] = useState(false);

  // Watch for catalog action click triggers
  useEffect(() => {
    if (selectedDeviceOnCatalog) {
      setSelectedDeviceId(selectedDeviceOnCatalog.id);
      // Optional: scroll to the form element
      const formElement = document.getElementById('loan-form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedDeviceOnCatalog]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPermissionLetter(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPermissionLetter(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setPermissionLetter(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setStudentName('');
    setStudentId('');
    setStudyProgram('');
    setMobileNumber('');
    const resetToday = getTodayString();
    const { borrowTime: resetBorrow, returnTime: resetReturn } = getRoundedTimeAndReturn();
    setBorrowDate(resetToday);
    setBorrowTime(resetBorrow);
    setReturnDate(resetToday);
    setReturnTime(resetReturn);
    setSelectedDeviceId('');
    setPurpose('');
    setPermissionLetter(null);
    setErrorMsg('');
    setSuccessApply(false);
    onClearSelectedDevice();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field audits
    if (!studentName.trim()) return setErrorMsg('Nama lengkap mahasiswa wajib diisi.');
    if (!studentId.trim() || studentId.length < 5) return setErrorMsg('NIM tidak valid (minimal 5 karakter).');
    if (!studyProgram) return setErrorMsg('Program Studi wajib dipilih.');
    if (!mobileNumber.trim() || mobileNumber.length < 9) return setErrorMsg('Nomor WhatsApp tidak valid.');
    if (!borrowDate) return setErrorMsg('Tanggal pinjam wajib ditentukan.');
    if (!borrowTime) return setErrorMsg('Jam pinjam wajib ditentukan.');
    if (!returnDate) return setErrorMsg('Tanggal kembali wajib ditentukan.');
    if (!returnTime) return setErrorMsg('Jam kembali wajib ditentukan.');
    
    if (new Date(returnDate) < new Date(borrowDate)) {
      return setErrorMsg('Tanggal kembali tidak boleh mendahului tanggal pinjam.');
    }
    
    if (borrowDate === returnDate && returnTime <= borrowTime) {
      return setErrorMsg('Jam kembali harus setelah jam pinjam jika dipinjam pada hari yang sama.');
    }
    
    if (!selectedDeviceId) return setErrorMsg('Silakan pilih salah satu alat (proyektor/speaker) dari daftar.');
    if (!purpose.trim()) return setErrorMsg('Tujuan peminjaman wajib diisi.');

    const targetDevice = devices.find(d => d.id === selectedDeviceId);
    if (!targetDevice) return setErrorMsg('Peralatan yang Anda pilih tidak valid.');

    // Submit payload
    onSubmitLoan({
      studentName,
      studentId,
      studyProgram,
      mobileNumber,
      borrowDate,
      borrowTime,
      returnDate,
      returnTime,
      deviceId: selectedDeviceId,
      deviceName: targetDevice.name,
      deviceCategory: targetDevice.category,
      purpose,
      permissionLetterName: permissionLetter ? permissionLetter.name : undefined,
      permissionLetterSize: permissionLetter ? `${(permissionLetter.size / (1024 * 1024)).toFixed(2)} MB` : undefined,
    });

    setSuccessApply(true);
    // Auto clear success layout state after 3 seconds
    setTimeout(() => {
      setSuccessApply(false);
      handleReset();
    }, 4000);
  };

  const availableDevicesList = devices.filter(d => d.isAvailable || d.id === selectedDeviceId);

  return (
    <div id="loan-form-section" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden scroll-mt-24">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          Formulir Pengajuan Peminjaman Alat
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Isi data dengan lengkap untuk diproses dan diverifikasi oleh admin perpustakaan / laboratorium.
        </p>
      </div>

      {successApply ? (
        <div className="p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">Pengajuan Berhasil Dikirim!</h4>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            Terima kasih {studentName}, permohonan pinjam alat <strong>{devices.find(d => d.id === selectedDeviceId)?.name}</strong> telah tersimpan di sistem.
          </p>
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-xs max-w-sm mx-auto">
            Menunggu konfirmasi admin. Status verifikasi akan segera muncul di tab Dashboard Mahasiswa Anda, dan Anda dapat mengambil alat dengan memverifikasi NIM Anda.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="cth. Ahmad Faisal"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Student ID (NIM) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nomor Induk Mahasiswa (NIM) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="cth. 10123045"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Study Program */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <select
                value={studyProgram}
                onChange={(e) => setStudyProgram(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-blue-500 focus:outline-none transition-colors"
                required
              >
                <option value="">-- Pilih Program Studi --</option>
                {STUDY_PROGRAMS.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            {/* WhatsApp/Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nomor WhatsApp (HP) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="cth. 08123456789"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Borrow Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tanggal Pinjam <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={borrowDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Borrow Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Jam Pinjam <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={borrowTime}
                  onChange={(e) => handleBorrowTimeChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>
            </div>

            {/* Return Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tanggal Kembali <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={returnDate}
                  min={borrowDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Return Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Jam Kembali <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Select Device */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Pilih Alat Proyektor / Speaker <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-blue-500 focus:outline-none transition-colors"
              required
            >
              <option value="">-- Pilih Alat --</option>
              {availableDevicesList.map((device) => (
                <option key={device.id} value={device.id}>
                  [{device.category}] {device.name} - Kondisi: {device.condition} ({device.isAvailable ? 'Tersedia' : 'Pilihan Anda'})
                </option>
              ))}
            </select>
          </div>

          {/* Purpose of borrowing */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Keperluan / Tujuan Peminjaman <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Sebutkan kegiatan atau keperluan peminjaman alat secara spesifik..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-colors resize-none"
              required
            ></textarea>
          </div>

          {/* Upload Permission Letter (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Unggah Surat Izin / Rekomendasi Fakultas (Opsional)
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center
                ${dragActive ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileChange}
              />
              
              {permissionLetter ? (
                <div className="flex items-center gap-3 text-left w-full max-w-md p-3.5 bg-slate-50 rounded-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{permissionLetter.name}</p>
                    <p className="text-xs text-slate-400">{(permissionLetter.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition"
                    title="Hapus file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-2">
                    <FileUp className="w-5 h-5 animate-bounce" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Tarik berkas ke sini atau Klik untuk memilih</p>
                  <p className="text-[10px] text-slate-400 mt-1">Mendukung PDF, Word, JPG, atau PNG (Maks 5MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Form CTA Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-[0.98]"
            >
              Ajukan Pinjaman
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
