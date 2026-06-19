import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Loan } from '../types';

interface ScheduleCalendarProps {
  loans: Loan[];
}

export default function ScheduleCalendar({ loans }: ScheduleCalendarProps) {
  // Use local time from mock metadata or current system date (June 2026 based on timestamp)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 19)); // Month index 5 is June
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-06-19');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Indonesian month names
  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Find loans scheduled on a specific date
  // A loan is active on a date if: date >= borrowDate AND date <= returnDate and status is approved/pending
  const getLoansForDate = (dateStr: string) => {
    return loans.filter(
      (loan) =>
        (loan.status === 'Approved' || loan.status === 'Pending') &&
        dateStr >= loan.borrowDate &&
        dateStr <= loan.returnDate
    );
  };

  const selectedLoans = getLoansForDate(selectedDateStr);

  return (
    <div id="schedule-calendar-section" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Jadwal Penggunaan Alat
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Lihat tanggal ketersediaan proyektor dan speaker sebelum melakukan pengajuan.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200 rounded-lg p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-700 px-2 min-w-[120px] text-center">
            {monthsIndo[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 md:divide-x md:divide-slate-100">
        {/* Calendar Grid */}
        <div className="lg:col-span-7 p-5">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <span key={day} className="text-xs font-semibold text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square bg-slate-50/50 rounded-lg opacity-40"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dateStr = formatDateString(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                dayNum
              );
              const isSelected = dateStr === selectedDateStr;
              const dayLoans = getLoansForDate(dateStr);
              const hasApproved = dayLoans.some((l) => l.status === 'Approved');
              const hasPending = dayLoans.some((l) => l.status === 'Pending');

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`relative p-2 rounded-lg text-sm text-center font-medium transition-all aspect-square flex flex-col items-center justify-between group cursor-pointer
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                      : 'hover:bg-slate-50 text-slate-700'
                    }
                  `}
                >
                  <span className="z-10">{dayNum}</span>

                  {/* Indicator Dot for bookings */}
                  {!isSelected && dayLoans.length > 0 && (
                    <div className="flex gap-0.5 justify-center mt-1 z-10 w-full">
                      {hasApproved && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Alat dipesan (Disetujui)" />
                      )}
                      {hasPending && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Alat dipesan (Pending)" />
                      )}
                    </div>
                  )}

                  {/* Active/Selected style dots */}
                  {isSelected && dayLoans.length > 0 && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Disetujui (Approved)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Menunggu (Pending)</span>
            </div>
            <div className="ml-auto text-slate-400">
              *Klik tanggal untuk detail
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-5 p-5 bg-slate-50/50">
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Detail Agenda
            </span>
            <h4 className="font-bold text-slate-800 text-base mt-1">
              Tanggal:{' '}
              {new Date(selectedDateStr).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
          </div>

          {selectedLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-xl text-center">
              <div className="bg-slate-100 p-3 rounded-full mb-3 text-slate-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-slate-600 text-sm font-medium">Semua Alat Tersedia</p>
              <p className="text-slate-400 text-xs mt-1">
                Belum ada pemesanan yang disetujui atau diajukan untuk tanggal ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {selectedLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {loan.deviceCategory}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1
                        ${loan.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }
                      `}
                    >
                      {loan.status === 'Approved' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Disetujui
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  <h5 className="font-semibold text-slate-800 text-sm mt-2">
                    {loan.deviceName}
                  </h5>

                  <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div>
                      <p className="text-slate-400 text-[10px]">Peminjam</p>
                      <p className="font-medium text-slate-700 truncate">{loan.studentName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Durasi Pinjam</p>
                      <p className="font-medium text-slate-700 text-[11px]">
                        {loan.borrowDate} s/d {loan.returnDate}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 bg-slate-50 rounded p-1.5 text-[11px] text-slate-600 italic">
                    &ldquo;{loan.purpose}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
