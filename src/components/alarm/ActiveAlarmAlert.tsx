import React from 'react';
import { Bell, Sliders, X } from 'lucide-react';
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
      className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-[340px] rounded-[32px] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden space-y-5">
        
        {/* Soft Ambient Reflections - Sama seperti di App.tsx */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-200/30 dark:bg-blue-600/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-sky-200/25 dark:bg-sky-500/10 blur-2xl pointer-events-none" />

        {/* Alarm Bell Icon */}
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-800/60 flex items-center justify-center shadow-sm">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Time & Label Info */}
        <div className="space-y-1">
          <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {hoursStr}:{minutesStr}
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[200px] truncate mx-auto">
            {alarm.label || 'Alarm'}
          </p>
        </div>

        {/* Action Buttons - Konsisten dengan AlarmList & Modal */}
        <div className="w-full space-y-2 pt-1">
          {/* Dismiss Button */}
          <button
            id="dismiss-alarm-btn"
            type="button"
            onClick={onDismiss}
            className="w-full h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm shadow-blue-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            Turn off the alarm
          </button>

          {/* Snooze Options */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSnooze(5)}
              className="h-9 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-slate-700 text-xs font-medium transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <Sliders className="w-3 h-3 rotate-90" />
              Tunda 5m
            </button>
            <button
              type="button"
              onClick={() => onSnooze(10)}
              className="h-9 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-slate-700 text-xs font-medium transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <Sliders className="w-3 h-3 rotate-90" />
              Tunda 10m
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};