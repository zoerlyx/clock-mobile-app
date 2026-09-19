import React from 'react';
import { Bell, Clock, X } from 'lucide-react';
import { Alarm } from '../../types';

interface ActiveAlarmAlertProps {
  alarm: Alarm | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const ActiveAlarmAlert: React.FC<ActiveAlarmAlertProps> = ({
  alarm,
  onDismiss,
  onSnooze,
}) => {
  if (!alarm) return null;

  const hoursStr = alarm.hour.toString().padStart(2, '0');
  const minutesStr = alarm.minute.toString().padStart(2, '0');

  return (
    <div
      id="active-alarm-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-sm rounded-[36px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-7 shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Soft pulsing ambient aura */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-blue-200/50 dark:bg-blue-600/20 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-sky-200/40 dark:bg-sky-500/15 blur-3xl animate-pulse pointer-events-none" />

        {/* Ringing Bell Icon */}
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/80 flex items-center justify-center mb-4 shadow-sm animate-bounce">
          <Bell className="w-8 h-8 fill-current" />
        </div>

        {/* Alarm Digital Time */}
        <span className="text-4xl sm:text-5xl font-mono font-light tracking-tight text-slate-900 dark:text-slate-100 mb-1">
          {hoursStr}:{minutesStr}
        </span>

        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-6">
          {alarm.label || 'Alarm'}
        </h3>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 relative z-10">
          <button
            id="dismiss-alarm-btn"
            type="button"
            onClick={onDismiss}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            Stop Alarm
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSnooze(5)}
              className="py-3 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              Snooze 5m
            </button>
            <button
              type="button"
              onClick={() => onSnooze(10)}
              className="py-3 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              Snooze 10m
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
