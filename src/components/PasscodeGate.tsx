import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';

interface PasscodeGateProps {
  onSuccess: () => void;
}

export default function PasscodeGate({ onSuccess }: PasscodeGateProps) {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'unaba123') {
      setError(false);
      setIsSuccessState(true);
      // Wait for success animation before calling callback
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      setError(true);
      setPasscode('');
    }
  };

  return (
    <div
      id="passcode-gate-container"
      className="max-w-md mx-auto bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div id="passcode-header-section" className="flex flex-col items-center space-y-3">
        <div
          id="passcode-icon-badge"
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isSuccessState
              ? 'bg-emerald-100 text-emerald-600 rotate-12 scale-110'
              : error
              ? 'bg-rose-100 text-rose-600 animate-bounce'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          {isSuccessState ? (
            <Unlock className="w-8 h-8" id="icon-unlock" />
          ) : error ? (
            <ShieldAlert className="w-8 h-8" id="icon-alert" />
          ) : (
            <Lock className="w-8 h-8" id="icon-lock" />
          )}
        </div>

        <h4 id="passcode-title" className="font-extrabold text-xl text-slate-800 tracking-tight">
          Verifikasi Akses UNABA
        </h4>
        <p id="passcode-description" className="text-xs text-slate-500 max-w-sm leading-relaxed">
          Sesuai dengan kebijakan baru administrasi kemahasiswaan Universitas Anak Bangsa, harap masukkan passcode akses portal untuk melanjutkan pengisian form peminjaman peralatan.
        </p>
      </div>

      <form id="passcode-form" onSubmit={handleSubmit} className="space-y-4">
        <div id="passcode-form-control" className="relative">
          <div id="passcode-key-icon-wrapper" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <KeyRound className="w-4 h-4" />
          </div>

          <input
            id="passcode-input"
            type={showPasscode ? 'text' : 'password'}
            placeholder="Masukkan Passcode (unaba123)"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              if (error) setError(false);
            }}
            disabled={isSuccessState}
            className={`w-full py-3 pl-10 pr-10 text-sm text-center font-mono rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 ${
              error
                ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-500 focus:border-rose-500'
                : isSuccessState
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 focus:ring-emerald-500 focus:border-emerald-500'
                : 'border-slate-200 bg-slate-55 text-slate-800 focus:ring-blue-500 focus:border-blue-500'
            }`}
            autoFocus
          />

          <button
            id="passcode-toggle-visibility"
            type="button"
            onClick={() => setShowPasscode(!showPasscode)}
            disabled={isSuccessState}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {showPasscode ? (
              <EyeOff className="w-4 h-4" id="icon-eye-off" />
            ) : (
              <Eye className="w-4 h-4" id="icon-eye" />
            )}
          </button>
        </div>

        {error && (
          <p id="passcode-error-text" className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1 animate-in fade-in duration-200">
            Passcode salah! Harap gunakan passcode kampus yang sah (unaba123).
          </p>
        )}

        {isSuccessState && (
          <p id="passcode-success-text" className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 animate-in fade-in duration-200">
            Akses diterima! Mengalihkan ke form peminjaman...
          </p>
        )}

        <button
          id="passcode-submit-btn"
          type="submit"
          disabled={isSuccessState || !passcode}
          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
            isSuccessState
              ? 'bg-emerald-650 hover:bg-emerald-700 text-white cursor-not-allowed'
              : !passcode
              ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          {isSuccessState ? 'Terverifikasi' : 'Verifikasi Akses'}
        </button>
      </form>

      <div id="passcode-footer-tip" className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-left text-[11px] text-slate-500">
        <span id="tip-title" className="font-bold text-slate-700 block mb-0.5">Petunjuk Hub Pengguna:</span>
        Untuk mempermudah demonstrasi dan review fitur, gunakan master passcode penguji: <code id="tip-code" className="font-mono bg-yellow-105 border border-yellow-200 text-slate-700 px-1 py-0.5 rounded text-[10px] font-bold">unaba123</code>
      </div>
    </div>
  );
}
