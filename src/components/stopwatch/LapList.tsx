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
      <div className="flex items-center justify-between px-3 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
        <span>Lap</span>
        <span>Split</span>
        <span>Total</span>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {reversedLaps.map((lap) => {
          const isFastest = laps.length >= 2 && lap.lapTime === minLapTime;
          const isSlowest = laps.length >= 2 && lap.lapTime === maxLapTime;

          return (
            <div
              key={lap.lapNumber}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-mono transition-colors ${
                isFastest
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300'
                  : isSlowest
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 font-sans font-semibold">
                <span className="text-slate-900 dark:text-slate-100">#{lap.lapNumber}</span>
                {isFastest && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-md">
                    <Trophy className="w-2.5 h-2.5" /> Best
                  </span>
                )}
                {isSlowest && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                    <TrendingDown className="w-2.5 h-2.5" /> Slow
                  </span>
                )}
              </div>

              <div className="font-semibold">
                +{formatMs(lap.lapTime)}
              </div>

              <div className="text-slate-400 dark:text-slate-500">
                {formatMs(lap.totalTime)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
