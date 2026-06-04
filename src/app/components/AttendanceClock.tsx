import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, X, CheckCircle, Calendar, Timer } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceRecord {
  clockIn: string | null;
  clockOut: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAttendance(userId: string) {
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `flamingo_attendance_${userId}_${todayKey}`;

  const [record, setRecord] = useState<AttendanceRecord>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || 'null') ?? { clockIn: null, clockOut: null };
    } catch {
      return { clockIn: null, clockOut: null };
    }
  });

  const save = (next: AttendanceRecord) => {
    localStorage.setItem(storageKey, JSON.stringify(next));
    setRecord(next);
  };

  const clockIn = () => save({ clockIn: new Date().toISOString(), clockOut: null });
  const clockOut = () => save({ ...record, clockOut: new Date().toISOString() });

  const isActive = !!record.clockIn && !record.clockOut;
  const isDone = !!record.clockIn && !!record.clockOut;

  return { record, clockIn, clockOut, isActive, isDone };
}

// ─── Live Clock ───────────────────────────────────────────────────────────────

function useLiveTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  userId: string;
  userName: string;
  userInitials: string;
  userColor: string;
  record: AttendanceRecord;
  isActive: boolean;
  isDone: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  onClose: () => void;
}

export function AttendanceModal({
  userName, userInitials, userColor,
  record, isActive, isDone,
  onClockIn, onClockOut, onClose,
}: ModalProps) {
  const now = useLiveTime();
  const [confirmed, setConfirmed] = useState(false);
  const [wasClockOut, setWasClockOut] = useState(false);

  const elapsed = isActive && record.clockIn
    ? differenceInSeconds(now, new Date(record.clockIn))
    : record.clockIn && record.clockOut
    ? differenceInSeconds(new Date(record.clockOut), new Date(record.clockIn))
    : 0;

  const handleAction = () => {
    if (isActive) {
      setWasClockOut(true);
      onClockOut();
    } else {
      setWasClockOut(false);
      onClockIn();
    }
    setConfirmed(true);
    setTimeout(onClose, 1800);
  };

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header band */}
        <div className={`px-6 pt-6 pb-5 ${isActive ? 'bg-rose-500' : isDone ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X size={14} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 ${userColor} rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {userInitials}
            </div>
            <div>
              <p className="text-white/80 text-xs">{greeting()},</p>
              <p className="text-white font-bold text-base leading-tight">{userName}</p>
            </div>
          </div>

          {/* Live time */}
          <div className="text-center">
            <p className="text-white text-4xl font-bold tracking-tight tabular-nums">
              {format(now, 'hh:mm')}
              <span className="text-2xl">{format(now, ':ss')}</span>
              <span className="text-lg ml-1.5 font-normal opacity-80">{format(now, 'aa')}</span>
            </p>
            <p className="text-white/70 text-xs mt-1 flex items-center justify-center gap-1.5">
              <Calendar size={11} />
              {format(now, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {confirmed ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle size={44} className="text-emerald-500" />
              <p className="font-bold text-gray-800 text-lg">
                {wasClockOut ? 'See you later!' : "You're clocked in!"}
              </p>
              <p className="text-xs text-gray-400">Attendance recorded</p>
            </div>
          ) : (
            <>
              {/* Status cards */}
              {(isActive || isDone) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Clocked In</p>
                    <p className="text-sm font-bold text-gray-800">
                      {record.clockIn ? format(new Date(record.clockIn), 'hh:mm aa') : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                      {isDone ? 'Clocked Out' : 'Duration'}
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {isDone && record.clockOut
                        ? format(new Date(record.clockOut), 'hh:mm aa')
                        : formatDuration(elapsed)}
                    </p>
                  </div>
                </div>
              )}

              {isDone && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700">Day Complete</p>
                    <p className="text-[11px] text-emerald-600">Total: {formatDuration(elapsed)}</p>
                  </div>
                </div>
              )}

              {!isDone && (
                <button
                  onClick={handleAction}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}>
                  {isActive ? <LogOut size={16} /> : <LogIn size={16} />}
                  {isActive ? 'Clock Out' : 'Clock In for Today'}
                </button>
              )}

              {!isActive && !isDone && (
                <p className="text-[11px] text-gray-400 text-center">
                  You haven't clocked in yet today
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Widget ───────────────────────────────────────────────────────────

interface WidgetProps {
  userName: string;
  userInitials: string;
  userColor: string;
  record: AttendanceRecord;
  isActive: boolean;
  isDone: boolean;
  collapsed: boolean;
  onOpen: () => void;
}

export function AttendanceWidget({
  userName, userInitials, userColor,
  record, isActive, isDone, collapsed, onOpen,
}: WidgetProps) {
  const now = useLiveTime();

  const elapsed = isActive && record.clockIn
    ? differenceInSeconds(now, new Date(record.clockIn))
    : 0;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center pb-1">
        <button
          onClick={onOpen}
          title={isActive ? 'Clocked In — Click to Clock Out' : 'Click to Clock In'}
          className="relative group">
          <div className={`w-8 h-8 ${userColor} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}>
            {userInitials}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            isActive ? 'bg-emerald-400' : isDone ? 'bg-blue-400' : 'bg-gray-300'
          }`} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Attendance card */}
      <div className={`rounded-2xl p-3 border ${
        isActive ? 'bg-emerald-50 border-emerald-200' : isDone ? 'bg-blue-50 border-blue-200' : 'bg-rose-50 border-rose-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-emerald-500 animate-pulse' : isDone ? 'bg-blue-400' : 'bg-gray-300'
            }`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isActive ? 'text-emerald-700' : isDone ? 'text-blue-700' : 'text-rose-600'
            }`}>
              {isActive ? 'Clocked In' : isDone ? 'Day Done' : 'Not Clocked In'}
            </span>
          </div>
          <Clock size={11} className={isActive ? 'text-emerald-500' : isDone ? 'text-blue-400' : 'text-rose-400'} />
        </div>

        {isActive && record.clockIn && (
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-[10px] text-gray-500">Since</p>
              <p className="text-xs font-bold text-gray-700">{format(new Date(record.clockIn), 'hh:mm aa')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">Duration</p>
              <p className="text-xs font-bold text-emerald-700 tabular-nums">{formatDuration(elapsed)}</p>
            </div>
          </div>
        )}

        {isDone && record.clockIn && record.clockOut && (
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-[10px] text-gray-500">In / Out</p>
              <p className="text-xs font-bold text-gray-700">
                {format(new Date(record.clockIn), 'hh:mm')} – {format(new Date(record.clockOut), 'hh:mm aa')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">Total</p>
              <p className="text-xs font-bold text-blue-700 tabular-nums">
                {formatDuration(differenceInSeconds(new Date(record.clockOut), new Date(record.clockIn)))}
              </p>
            </div>
          </div>
        )}

        {!isDone && (
          <button
            onClick={onOpen}
            className={`w-full py-2 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}>
            {isActive ? <LogOut size={12} /> : <LogIn size={12} />}
            {isActive ? 'Clock Out' : 'Clock In'}
          </button>
        )}
      </div>

      {/* User row */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <div className={`w-9 h-9 ${userColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
            {userInitials}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            isActive ? 'bg-emerald-400' : isDone ? 'bg-blue-400' : 'bg-gray-300'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
          <p className="text-[11px] text-gray-400">
            {isActive ? 'Working now' : isDone ? 'Signed off' : 'Tap to clock in'}
          </p>
        </div>
      </div>
    </div>
  );
}
