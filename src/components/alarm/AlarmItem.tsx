import React from 'react';
import { Alarm } from '../../types';
import { soundEngine } from '../../services/audio';

interface AlarmItemProps {
  alarm: Alarm;
  militaryTime: boolean;
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
}

export const AlarmItem: React.FC<AlarmItemProps> = ({
  alarm,
  militaryTime,
  onToggle,
  onEdit,
}) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const displayHours = militaryTime
    ? alarm.hour
    : alarm.hour % 12 || 12;
  const hoursStr = displayHours.toString().padStart(militaryTime ? 2 : 1, '0');
  const minutesStr = alarm.minute.toString().padStart(2, '0');
  const ampm = !militaryTime ? (alarm.hour >= 12 ? 'PM' : 'AM') : '';

  const isRecurring = alarm.repeatDays && alarm.repeatDays.length > 0;

  return (
    <div
      id={`alarm-card-${alarm.id}`}
      onClick={() => onEdit(alarm)}
      className={`group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 border cursor-pointer ${
        alarm.enabled
          ? 'bg-white dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] dark:hover:border-slate-700'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-100/60 dark:border-slate-800/60 opacity-60 hover:opacity-80'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Time & Essential Info */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {hoursStr}:{minutesStr}
            </span>
            {!militaryTime && (
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                {ampm}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {alarm.label || 'Alarm'}
            </span>

            {/* Repeat Day Dots */}
            {isRecurring ? (
              <div className="flex items-center gap-1 ml-1">
                {daysOfWeek.map((day, idx) => {
                  const isDayActive = alarm.repeatDays?.includes(idx as any);
                  return (
                    <span
                      key={idx}
                      className={`w-4 h-4 rounded-full text-[9px] font-semibold flex items-center justify-center transition-colors ${
                        isDayActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Once</span>
            )}
          </div>
        </div>

        {/* Right: Toggle */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          {/* Neo-Apple Pill Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={alarm.enabled}
            onClick={() => {
              soundEngine.playClick(alarm.enabled ? 500 : 850);
              onToggle(alarm.id);
            }}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              alarm.enabled ? 'bg-blue-600 shadow-sm shadow-blue-500/25' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                alarm.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
