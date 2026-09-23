import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bookmark, BellRing, ChevronUp, ChevronDown } from 'lucide-react';
import { TimerPreset, ActiveTimerState, TimerStatus } from '../../types';
import { ThreeTimerRing } from '../3d/ThreeTimerRing';
import { PresetList } from './PresetList';
import { PresetModal } from './PresetModal';
import { soundEngine } from '../../services/audio';
import { NotificationManager } from '../../services/notifications';
import { saveActiveTimer, getActiveTimer } from '../../services/storage';

interface TimerDisplayProps {
  initialState: ActiveTimerState | null;
  presets: TimerPreset[];
  enable3D: boolean;
  onSavePreset: (presetData: { id?: string; name: string; duration: number }) => void;
  onDeletePreset: (id: string) => void;
  // 1. TAMBAHKAN DUA PROP INI AGAR INTERFACE BERSIH DAN SESUAI DENGAN App.tsx
  onStateChange?: (state: ActiveTimerState | null) => void;
}

const STORAGE_KEY_SAVED_PICKER = 'oclock_timer_picker_values';

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  initialState,
  presets,
  enable3D,
  onSavePreset,
  onDeletePreset,
  onStateChange, // 2. RECEIVE PROP DI SINI
}) => {
  // Read last configured picker duration
  const getSavedPicker = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_PICKER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      /* ignore */
    }
    return { h: 0, m: 15, s: 0 };
  };

  const initialPicker = getSavedPicker();
  const [setHours, setSetHours] = useState<number>(initialPicker.h);
  const [setMinutes, setSetMinutes] = useState<number>(initialPicker.m);
  const [setSeconds, setSetSeconds] = useState<number>(initialPicker.s);

  // Load latest active timer from storage or props on initial mount
  const currentSavedTimer = getActiveTimer() || initialState;

  // Calculate actual initial remaining time if it was running in background
  const getInitialRemainingAndStatus = (): { remaining: number; status: TimerStatus; duration: number } => {
    if (!currentSavedTimer) {
      const dur = initialPicker.h * 3600 + initialPicker.m * 60 + initialPicker.s;
      return { remaining: dur, status: 'idle', duration: dur };
    }

    if (currentSavedTimer.status === 'running' && currentSavedTimer.targetEndTime) {
      const diffMs = currentSavedTimer.targetEndTime - Date.now();
      const leftSec = Math.max(0, Math.ceil(diffMs / 1000));
      if (leftSec <= 0) {
        return { remaining: 0, status: 'finished', duration: currentSavedTimer.duration };
      }
      return { remaining: leftSec, status: 'running', duration: currentSavedTimer.duration };
    }

    return {
      remaining: currentSavedTimer.remaining,
      status: currentSavedTimer.status,
      duration: currentSavedTimer.duration,
    };
  };

  const initData = getInitialRemainingAndStatus();

  const [label, setLabel] = useState<string>(currentSavedTimer?.label || 'Timer');
  const [status, setStatus] = useState<TimerStatus>(initData.status);
  const [totalDuration, setTotalDuration] = useState<number>(initData.duration);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initData.remaining);

  const targetEndTimeRef = useRef<number | null>(
    currentSavedTimer?.targetEndTime || null
  );

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<TimerPreset | null>(null);

  // Save picker configuration whenever changed
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_SAVED_PICKER,
      JSON.stringify({ h: setHours, m: setMinutes, s: setSeconds })
    );
  }, [setHours, setMinutes, setSeconds]);

  // Sync state to storage whenever status/time changes
  const persistTimer = (
    newStatus: TimerStatus,
    newRemaining: number,
    newDuration: number,
    newTargetEndTime: number | null
  ) => {
    const timerState = newStatus === 'idle' ? null : {
      duration: newDuration,
      remaining: newRemaining,
      status: newStatus,
      startedAt: newStatus === 'running' ? Date.now() : null,
      targetEndTime: newTargetEndTime,
      label,
    };

    saveActiveTimer(timerState);

    // 3. SEBARKAN STATUS BARU KE App.tsx AGAR BottomNav MENGETAHUI TIMER RUNNING
    if (onStateChange) {
      onStateChange(timerState);
    }
  };

  // Main Background-safe Timer Loop
  useEffect(() => {
    if (status !== 'running') return;

    let animId: number;

    const tick = () => {
      if (!targetEndTimeRef.current) return;

      const now = Date.now();
      const diffMs = targetEndTimeRef.current - now;
      const leftSec = Math.max(0, Math.ceil(diffMs / 1000));

      setRemainingSeconds(leftSec);

      if (leftSec <= 0) {
        setStatus('finished');
        targetEndTimeRef.current = null;
        persistTimer('finished', 0, totalDuration, null);
        soundEngine.playTimerFinished(true);

        NotificationManager.sendNotification('Timer Finished!', {
          body: `${label || 'Timer'} for ${formatTime(totalDuration)} has finished.`,
        });
        return;
      }

      // Persist state periodically
      persistTimer('running', leftSec, totalDuration, targetEndTimeRef.current);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && targetEndTimeRef.current) {
        const now = Date.now();
        const diffMs = targetEndTimeRef.current - now;
        const leftSec = Math.max(0, Math.ceil(diffMs / 1000));
        setRemainingSeconds(leftSec);

        if (leftSec <= 0) {
          setStatus('finished');
          targetEndTimeRef.current = null;
          persistTimer('finished', 0, totalDuration, null);
          soundEngine.playTimerFinished(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, label, totalDuration]);

  const handleStart = () => {
    soundEngine.playClick(900);
    const duration = setHours * 3600 + setMinutes * 60 + setSeconds;
    if (duration <= 0) return;

    const now = Date.now();
    const targetEnd = now + duration * 1000;
    targetEndTimeRef.current = targetEnd;

    setTotalDuration(duration);
    setRemainingSeconds(duration);
    setStatus('running');

    persistTimer('running', duration, duration, targetEnd);
  };

  const handlePause = () => {
    soundEngine.playClick(700);
    setStatus('paused');
    targetEndTimeRef.current = null;
    persistTimer('paused', remainingSeconds, totalDuration, null);
  };

  const handleResume = () => {
    soundEngine.playClick(900);
    const now = Date.now();
    const targetEnd = now + remainingSeconds * 1000;
    targetEndTimeRef.current = targetEnd;
    setStatus('running');

    persistTimer('running', remainingSeconds, totalDuration, targetEnd);
  };

  const handleReset = () => {
    soundEngine.playClick(500);
    setStatus('idle');
    targetEndTimeRef.current = null;
    setRemainingSeconds(totalDuration);

    persistTimer('idle', totalDuration, totalDuration, null);
  };

  const handleSelectPreset = (preset: TimerPreset) => {
    const dur = preset.duration;
    const h = Math.floor(dur / 3600);
    const m = Math.floor((dur % 3600) / 60);
    const s = dur % 60;

    setTotalDuration(dur);
    setRemainingSeconds(dur);
    setLabel(preset.name);

    setSetHours(h);
    setSetMinutes(m);
    setSetSeconds(s);

    const now = Date.now();
    const targetEnd = now + dur * 1000;
    targetEndTimeRef.current = targetEnd;
    setStatus('running');

    persistTimer('running', dur, dur, targetEnd);
  };

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const hStr = h > 0 ? `${h}:` : '';
    const mStr = (h > 0 ? m.toString().padStart(2, '0') : m.toString()).padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    return `${hStr}${mStr}:${sStr}`;
  };

  const progressFraction = totalDuration > 0 ? remainingSeconds / totalDuration : 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 pt-8 pb-32 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Timer
          {status === 'running' && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          )}
        </h1>
      </div>

      {/* Main Display: Idle Dial or Active 3D Ring */}
      {status === 'idle' ? (
        <div className="flex flex-col items-center py-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-300">
          {/* Time Picker Columns */}
          <div className="flex items-center justify-center gap-2 select-none my-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                HOURS
              </span>
              <button
                type="button"
                onClick={() => setSetHours(Math.min(23, (Number(setHours) || 0) + 1))}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors mb-1"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <input
                type="number"
                min={0}
                max={23}
                value={setHours.toString().padStart(2, '0')}
                onChange={(e) => setSetHours(Math.max(0, Math.min(23, Number(e.target.value) || 0)))}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl sm:text-4xl font-light text-slate-900 dark:text-slate-100 shadow-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setSetHours(Math.max(0, (Number(setHours) || 0) - 1))}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors mt-1"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="text-2xl font-light text-slate-300 dark:text-slate-600">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                MINUTES
              </span>
              <button
                type="button"
                onClick={() => setSetMinutes(Math.min(59, (Number(setMinutes) || 0) + 1))}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors mb-1"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <input
                type="number"
                min={0}
                max={59}
                value={setMinutes.toString().padStart(2, '0')}
                onChange={(e) => setSetMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl sm:text-4xl font-light text-slate-900 dark:text-slate-100 shadow-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setSetMinutes(Math.max(0, (Number(setMinutes) || 0) - 1))}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors mt-1"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="text-2xl font-light text-slate-300 dark:text-slate-600">:</div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                SECONDS
              </span>
              <button
                type="button"
                onClick={() => setSetSeconds(Math.min(59, (Number(setSeconds) || 0) + 1))}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors mb-1"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <input
                type="number"
                min={0}
                max={59}
                value={setSeconds.toString().padStart(2, '0')}
                onChange={(e) => setSetSeconds(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl sm:text-4xl font-light text-slate-900 dark:text-slate-100 shadow-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setSetSeconds(Math.max(0, (Number(setSeconds) || 0) - 1))}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors mt-1"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-8">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(700);
                const dur = setHours * 3600 + setMinutes * 60 + setSeconds;
                if (dur > 0) {
                  onSavePreset({
                    name: label.trim() || `${formatTime(dur)} Timer`,
                    duration: dur,
                  });
                }
              }}
              disabled={setHours === 0 && setMinutes === 0 && setSeconds === 0}
              className="py-3.5 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 disabled:opacity-40 text-blue-700 dark:text-blue-300 font-medium text-xs border border-blue-100 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Save
            </button>

            <button
              id="start-timer-btn"
              type="button"
              onClick={handleStart}
              disabled={setHours === 0 && setMinutes === 0 && setSeconds === 0}
              className="py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              Start
            </button>
          </div>
        </div>
      ) : (
        /* Active Running / Paused Ring */
        <div className="flex flex-col min-h-110 items-center py-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[36px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden transition-colors duration-300">
          <div className="relative flex items-center justify-center my-2">
            <ThreeTimerRing
              progress={progressFraction}
              status={status}
              size={240}
              enabled3D={enable3D}
            />

            {/* Centered Digital Countdown */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5 transition-colors">
                {label || 'Timer'}
              </span>

              <span className="text-4xl sm:text-5xl font-mono font-light tracking-tight text-slate-900 dark:text-slate-100 transition-colors">
                {formatTime(remainingSeconds)}
              </span>

              {status === 'finished' && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Finished</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs mt-8">
            <button
              id="reset-timer-btn"
              type="button"
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              Reset
            </button>

            {status === 'running' && (
              <button
                id="pause-timer-btn"
                type="button"
                onClick={handlePause}
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause
              </button>
            )}

            {status === 'paused' && (
              <button
                id="resume-timer-btn"
                type="button"
                onClick={handleResume}
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume
              </button>
            )}

            {status === 'finished' && (
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Saved Presets */}
      <PresetList
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onAddPreset={() => {
          setPresetToEdit(null);
          setIsPresetModalOpen(true);
        }}
        onEditPreset={(preset) => {
          setPresetToEdit(preset);
          setIsPresetModalOpen(true);
        }}
        onDeletePreset={onDeletePreset}
      />

      {/* Preset Modal */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSave={onSavePreset}
        presetToEdit={presetToEdit}
        onDeletePreset={onDeletePreset}
      />
    </div>
  );
};
