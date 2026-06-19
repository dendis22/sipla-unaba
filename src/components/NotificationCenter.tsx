import React from 'react';
import { Bell, Check, Trash2, CalendarClock, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
  onClose,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
            <CalendarClock className="w-4 h-4" />
          </div>
        );
      case 'error':
        return (
          <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-sky-50 rounded-lg text-sky-500">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-slate-800 text-sm">Notifikasi ({unreadCount})</h4>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 transition"
              title="Hapus Semua"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>

      <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">Tidak ada notifikasi baru</p>
            <p className="text-[10px] mt-0.5">Sistem berjalan dengan aman dan lancar.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex gap-3 transition hover:bg-slate-50 ${
                !notif.read ? 'bg-blue-50/20' : ''
              }`}
            >
              {getIcon(notif.type)}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-1">
                  <p className={`text-xs ${!notif.read ? 'font-bold' : 'font-semibold'} text-slate-800`}>
                    {notif.title}
                  </p>
                  <span className="text-[9px] text-slate-400 whitespace-nowrap">
                    {new Date(notif.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
                {!notif.read && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:text-blue-800"
                  >
                    <Check className="w-3.5 h-3.5" /> Tandai Dibaca
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[11px] text-center text-slate-500">
        Klik tombol notifikasi untuk menambah notifikasi simulasi baru.
      </div>
    </div>
  );
}
