import React from 'react';
import { LapRecord } from '../../types';
import { Trophy, TrendingDown } from 'lucide-react';

interface LapListProps {
  laps: LapRecord[];
}

export const LapList: React.FC<LapListProps> = ({ laps }) => {
  if (laps.length === 0) {
    return (
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        Record laps while the stopwatch is running.
      </div>
    );
  }

  let minLapTime = Infinity;
  let maxLapTime = -Infinity;

  if (laps.length >= 2) {
    laps.forEach((l) => {
      if (l.lapTime < minLapTime) minLapTime = l.lapTime;
      if (l.lapTime > maxLapTime) maxLapTime = l.lapTime;
    });
  }

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    const hStr = hundredths.toString().padStart(2, '0');

    return `${mStr}:${sStr}.${hStr}`;
  };

  const reversedLaps = [...laps].reverse();

  return (
    <div className="space-y-2">
      {/* Header Alignment via Grid */}
      <div className="grid grid-cols-12 px-4 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
        <span className="col-span-5">Lap</span>
        <span className="col-span-4 text-right pr-2">Split</span>
        <span className="col-span-3 text-right">Total</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {reversedLaps.map((lap) => {
          const isFastest = laps.length >= 2 && lap.lapTime === minLapTime;
          const isSlowest = laps.length >= 2 && lap.lapTime === maxLapTime;

          return (
            <div
              key={lap.lapNumber}
              className={`grid grid-cols-12 items-center px-4 py-3.5 rounded-2xl border font-mono transition-colors ${
                isFastest
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300'
                  : isSlowest
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs'
              }`}
            >
              {/* Kolom 1: Lap Number + Badge (Fixed Col-Span 5) */}
              <div className="col-span-5 flex items-center gap-1.5 font-sans font-bold text-sm min-w-0">
                <span className="text-slate-900 dark:text-slate-100 text-base shrink-0">
                  #{lap.lapNumber}
                </span>
                {isFastest && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-md shrink-0">
                    <Trophy className="w-3 h-3" /> Best
                  </span>
                )}
                {isSlowest && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md shrink-0">
                    <TrendingDown className="w-3 h-3" /> Slow
                  </span>
                )}
              </div>

              {/* Kolom 2: Split Time (Fixed Col-Span 4 & Alignment Terkunci) */}
              <div className="col-span-4 text-right pr-2 font-semibold text-base tracking-tight whitespace-nowrap">
                +{formatMs(lap.lapTime)}
              </div>

              {/* Kolom 3: Total Time (Fixed Col-Span 3 & Alignment Terkunci) */}
              <div className="col-span-3 text-right text-sm font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {formatMs(lap.totalTime)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
