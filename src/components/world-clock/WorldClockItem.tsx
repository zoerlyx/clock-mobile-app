import React from 'react';
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
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 border cursor-pointer select-none ${
        isSelected
          ? 'bg-white dark:bg-slate-900 border-blue-500/80 shadow-[0_12px_32px_rgba(59,130,246,0.14)] dark:shadow-[0_12px_32px_rgba(37,99,235,0.2)] ring-2 ring-blue-500/20'
          : 'bg-white dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 hover:border-slate-200/80 dark:hover:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: City, Offset & Date */}
        <div className="flex-1 min-w-0 space-y-1">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {location.city}
            </h3>
          </div>

          {/* Offset & Date aligned together */}
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 pt-1">
            {info.offsetDiffStr && <span>{info.offsetDiffStr} / </span>}
            <span>{info.dateStr}</span>
          </div>
        </div>

        {/* Right: Digital Time */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-3xl sm:text-4xl font-light font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                {displayTime}
              </span>
              {!militaryTime && (
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                  {info.amPmStr}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
