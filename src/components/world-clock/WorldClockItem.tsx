import React from 'react';
import { Sun, Moon, Trash2 } from 'lucide-react';
import { WorldClockLocation } from '../../types';
import { getTimezoneInfo } from '../../services/timezones';

interface WorldClockItemProps {
  location: WorldClockLocation;
  currentDate: Date;
  militaryTime: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDelete: (id: string) => void;
}

export const WorldClockItem: React.FC<WorldClockItemProps> = ({
  location,
  currentDate,
  militaryTime,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const info = getTimezoneInfo(location.timezone, currentDate);

  let displayTime = info.timeStr;
  if (militaryTime) {
    displayTime = `${info.hours24.toString().padStart(2, '0')}:${info.minutes.toString().padStart(2, '0')}`;
  }

  return (
    <div
      id={`world-clock-item-${location.id}`}
      onClick={() => onSelect(location.id)}
      className={`group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 border cursor-pointer ${
        isSelected
          ? 'bg-white dark:bg-slate-900 border-blue-500/80 shadow-[0_12px_32px_rgba(59,130,246,0.14)] dark:shadow-[0_12px_32px_rgba(37,99,235,0.2)] ring-2 ring-blue-500/20'
          : 'bg-white dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 hover:border-slate-200/80 dark:hover:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Top Row: City & Time */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: City & Country */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {location.city}
            </span>
            {info.isDaytime ? (
              <span className="p-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400" title="Daytime">
                <Sun className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Nighttime">
                <Moon className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 font-normal truncate">
            {location.country}
          </div>
        </div>

        {/* Right: Digital Time & Date */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl sm:text-3xl font-light font-mono text-slate-900 dark:text-slate-100">
              {displayTime}
            </span>
            {!militaryTime && (
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                {info.amPmStr}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {info.dateStr}
          </div>
        </div>
      </div>

      {/* Divider line & Bottom Row: Today/Tomorrow info aligned with Delete button */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>{info.dayRelativeStr}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span>{info.offsetDiffStr}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(location.id);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/80 dark:hover:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 transition-colors"
          title="Hapus lokasi"
          aria-label={`Hapus ${location.city}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );
};
