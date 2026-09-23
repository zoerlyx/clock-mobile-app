import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { LapRecord, StopwatchState } from '../../types';
import { LapList } from './LapList';
import { soundEngine } from '../../services/audio';
import { saveActiveStopwatch, getActiveStopwatch } from '../../services/storage';

interface StopwatchDisplayProps {
  initialState?: StopwatchState | null;
  enable3D?: boolean;
}

export const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  initialState = null,
  enable3D = true,
}) => {
  // 1. Gunakan Lazy Initializer agar selalu mengambil data paling segar dari LocalStorage/Props saat Mount
  const [stopwatchState, setStopwatchState] = useState<StopwatchState>(() => {
    // Prioritaskan initialState HANYA jika valid & memiliki data elapsedTime / isRunning
    if (initialState && (initialState.elapsedTime > 0 || initialState.isRunning)) {
      return initialState;
    }
    return getActiveStopwatch() || {
      elapsedTime: 0,
      isRunning: false,
      startedAt: null,
      pausedAt: null,
      laps: [],
    };
  });

  const { isRunning, elapsedTime, laps } = stopwatchState;

  const startedAtRef = useRef<number | null>(stopwatchState.startedAt);
  const lastStartTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(elapsedTime);
  const lastSecondRef = useRef<number>(Math.floor(elapsedTime / 1000));

  // 2. Sinkronkan ref setiap elapsedTime terupdate
  useEffect(() => {
    accumulatedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  // 3. Auto-save ke LocalStorage setiap ada perubahan state
  useEffect(() => {
    saveActiveStopwatch({
      elapsedTime,
      isRunning,
      startedAt: isRunning ? startedAtRef.current : null,
      pausedAt: !isRunning && elapsedTime > 0 ? Date.now() : null,
      laps,
    });
  }, [elapsedTime, isRunning, laps]);

  // 4. Loop Animasi Utama (requestAnimationFrame)
  useEffect(() => {
    if (!isRunning) {
      lastStartTimeRef.current = null;
      return;
    }

    lastStartTimeRef.current = performance.now();
    const baseTime = accumulatedTimeRef.current;
    let animId: number;

    const update = () => {
      if (lastStartTimeRef.current !== null) {
        const now = performance.now();
        const delta = now - lastStartTimeRef.current;
        const currentTotal = baseTime + delta;

        setStopwatchState((prev) => ({
          ...prev,
          elapsedTime: currentTotal,
        }));

        const currentSec = Math.floor(currentTotal / 1000);
        if (currentSec !== lastSecondRef.current) {
          lastSecondRef.current = currentSec;
          soundEngine.playTick(currentSec % 5 === 0);
        }
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
      lastStartTimeRef.current = null;
    };
  }, [isRunning]);

  // 5. Handlers
  const handleStart = () => {
    soundEngine.playClick(950);
    const now = Date.now();
    startedAtRef.current = now;
    accumulatedTimeRef.current = elapsedTime;

    setStopwatchState((prev) => ({
      ...prev,
      isRunning: true,
      startedAt: now,
      pausedAt: null,
    }));
  };

  const handlePause = () => {
    soundEngine.playClick(650);
    startedAtRef.current = null;
    accumulatedTimeRef.current = elapsedTime;

    setStopwatchState((prev) => ({
      ...prev,
      isRunning: false,
      startedAt: null,
      pausedAt: Date.now(),
    }));
  };

  const handleReset = () => {
    soundEngine.playClick(450);
    startedAtRef.current = null;
    accumulatedTimeRef.current = 0;
    lastStartTimeRef.current = null;
    lastSecondRef.current = 0;

    const resetState: StopwatchState = {
      elapsedTime: 0,
      isRunning: false,
      startedAt: null,
      pausedAt: null,
      laps: [],
    };

    setStopwatchState(resetState);
    saveActiveStopwatch(null);
  };

  const handleLap = () => {
    if (!isRunning && elapsedTime === 0) return;
    soundEngine.playClick(850);

    const currentTotal = elapsedTime;
    const previousTotal = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
    const lapSplit = currentTotal - previousTotal;

    const newLap: LapRecord = {
      lapNumber: laps.length + 1,
      lapTime: lapSplit,
      totalTime: currentTotal,
      timestamp: Date.now(),
    };

    setStopwatchState((prev) => ({
      ...prev,
      laps: [...prev.laps, newLap],
    }));
  };

  // Kalkulasi Tampilan Digital
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((elapsedTime % 1000) / 10);

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');
  const hStr = hundredths.toString().padStart(2, '0');

  // Kalkulasi Sudut Jarum Analog
  const secondHandAngle = ((elapsedTime % 60000) / 60000) * 360;
  const minuteSubdialAngle = ((elapsedTime % 1800000) / 1800000) * 360;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 pt-8 pb-32 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Stopwatch
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          )}
        </h1>
      </div>

      {/* Analog + Digital Neo-Apple Stage */}
      <div className="shrink-0 flex flex-col items-center py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
        {/* Analog Precision Dial */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center select-none my-1">
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.04)] dark:drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
            <circle 
              cx="100"
              cy="100"
              r="94"
              className="fill-white dark:fill-slate-900 stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="4"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              className="fill-white dark:fill-slate-900 stroke-slate-50 dark:stroke-slate-800/60"
              strokeWidth="1.5"
            />

            {/* 60 Hash Ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              return (
                <line
                  key={i}
                  x1="100"
                  y1={isMajor ? '14' : '18'}
                  x2="100"
                  y2={isMajor ? '26' : '23'}
                  className={
                    isMajor
                      ? 'stroke-slate-900 dark:stroke-slate-100'
                      : 'stroke-slate-300 dark:stroke-slate-700'
                  }
                  strokeWidth={isMajor ? '2' : '1'}
                  strokeLinecap="round"
                  transform={`rotate(${i * 6} 100 100)`}
                />
              );
            })}

            <text x="100" y="40" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="600" fontFamily="sans-serif">60</text> 
            <text x="162" y="103" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="600" fontFamily="sans-serif">15</text>
            <text x="100" y="166" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="600" fontFamily="sans-serif">30</text>
            <text x="38" y="103" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="600" fontFamily="sans-serif">45</text>

            {/* Minute Subdial */}
            <g transform="translate(100, 72)">
              <circle cx="0" cy="0" r="20" className="fill-slate-50 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" />
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="-20"
                  x2="0"
                  y2="-15"
                  className="stroke-slate-400 dark:stroke-slate-500"
                  strokeWidth="1"
                  transform={`rotate(${i * 60})`}
                />
              ))}
              <line
                x1="0"
                y1="3"
                x2="0"
                y2="-16"
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeLinecap="round"
                transform={`rotate(${minuteSubdialAngle})`}
              />
              <circle cx="0" cy="0" r="2.5" fill="#2563eb" />
            </g>

            {/* Sweeping Needle */}
            <g transform={`rotate(${secondHandAngle} 100 100)`}>
              <line
                x1="100"
                y1="118"
                x2="100"
                y2="100"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="114" r="2.5" fill="#2563eb" />
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="16"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>

            {/* Center Pin */}
            <circle cx="100" cy="100" r="4" className="fill-slate-900 dark:fill-slate-100 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Digital Readout */}
        <div className="flex items-baseline justify-center gap-1 my-3">
          <span className="text-4xl sm:text-5xl font-light font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {mStr}:{sStr}
          </span>
          <span className="text-xl sm:text-2xl font-light font-mono text-blue-600 dark:text-blue-400">
            .{hStr}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3 w-full max-w-xs mt-1">
          {isRunning ? (
            <button
              id="stopwatch-lap-btn"
              type="button"
              onClick={handleLap}
              className="flex-1 py-3 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-blue-100 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <Flag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Lap
            </button>
          ) : (
            <button
              id="stopwatch-reset-btn"
              type="button"
              onClick={handleReset}
              disabled={elapsedTime === 0}
              className="flex-1 py-3 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 disabled:opacity-30 text-blue-700 dark:text-blue-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-blue-100 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Reset
            </button>
          )}

          {!isRunning ? (
            <button
              id="stopwatch-start-btn"
              type="button"
              onClick={handleStart}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {elapsedTime > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              id="stopwatch-pause-btn"
              type="button"
              onClick={handlePause}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pause
            </button>
          )}
        </div>
      </div>

      {/* Lap List */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        <LapList laps={laps} />
      </div>
    </div>
  );
};
