import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Bookmark, BellRing } from 'lucide-react';
import { TimerPreset, ActiveTimerState, TimerStatus } from '../../types';
import { ThreeTimerRing } from '../3d/ThreeTimerRing';
import { PresetList } from './PresetList';
import { PresetModal } from './PresetModal';
import { soundEngine } from '../../services/audio';
import { NotificationManager } from '../../services/notifications';
import { saveActiveTimer } from '../../services/storage';

interface TimerDisplayProps {
  initialState: ActiveTimerState | null;
  presets: TimerPreset[];
  enable3D: boolean;
  onSavePreset: (presetData: { id?: string; name: string; duration: number }) => void;
  onDeletePreset: (id: string) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  initialState,
  presets,
  enable3D,
  onSavePreset,
  onDeletePreset,
}) => {
  const [setHours, setSetHours] = useState(0);
  const [setMinutes, setSetMinutes] = useState(15);
  const [setSeconds, setSetSeconds] = useState(0);
  const [label, setLabel] = useState('Timer');

  const [status, setStatus] = useState<TimerStatus>(initialState?.status || 'idle');
  const [totalDuration, setTotalDuration] = useState<number>(initialState?.duration || 15 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialState?.remaining || 15 * 60);
  const targetEndTimeRef = useRef<number | null>(initialState?.targetEndTime || null);

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<TimerPreset | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      saveActiveTimer(null);
    } else {
      saveActiveTimer({
        duration: totalDuration,
        remaining: remainingSeconds,
        status,
        startedAt: status === 'running' ? Date.now() : null,
        targetEndTime: targetEndTimeRef.current,
        label,
      });
    }
  }, [status, remainingSeconds, totalDuration, label]);

  // Timestamp-based countdown loop
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
        soundEngine.playTimerFinished(true);

        NotificationManager.sendNotification('Timer Finished!', {
          body: `${label || 'Timer'} for ${formatTime(totalDuration)} has finished.`,
        });
        return;
      }

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
    targetEndTimeRef.current = now + duration * 1000;
    setTotalDuration(duration);
    setRemainingSeconds(duration);
    setStatus('running');
  };

  const handlePause = () => {
    soundEngine.playClick(700);
    setStatus('paused');
    targetEndTimeRef.current = null;
  };

  const handleResume = () => {
    soundEngine.playClick(900);
    const now = Date.now();
    targetEndTimeRef.current = now + remainingSeconds * 1000;
    setStatus('running');
  };

  const handleReset = () => {
    soundEngine.playClick(500);
    setStatus('idle');
    targetEndTimeRef.current = null;
    setRemainingSeconds(totalDuration);
  };

  const handleAddMinute = () => {
    soundEngine.playClick(850);
    if (status === 'running' && targetEndTimeRef.current) {
      targetEndTimeRef.current += 60 * 1000;
      setTotalDuration((prev) => prev + 60);
      setRemainingSeconds((prev) => prev + 60);
    } else if (status === 'paused') {
      setTotalDuration((prev) => prev + 60);
      setRemainingSeconds((prev) => prev + 60);
    }
  };

  const handleSelectPreset = (preset: TimerPreset) => {
    const dur = preset.duration;
    setTotalDuration(dur);
    setRemainingSeconds(dur);
    setLabel(preset.name);
    setSetHours(Math.floor(dur / 3600));
    setSetMinutes(Math.floor((dur % 3600) / 60));
    setSetSeconds(dur % 60);

    const now = Date.now();
    targetEndTimeRef.current = now + dur * 1000;
    setStatus('running');
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

  const progressFraction =
    totalDuration > 0 ? remainingSeconds / totalDuration : 0;

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
        <div className="flex flex-col items-center py-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          {/* Time Picker Columns */}
          <div className="flex items-center justify-center gap-2 select-none my-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                HOURS
              </span>
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl sm:text-4xl font-light text-slate-900 dark:text-slate-100 shadow-xs">
                {setHours.toString().padStart(2, '0')}
              </div>
              <div className="flex gap-1 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(600);
                    setSetHours((h) => Math.min(23, h + 1));
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100/60 dark:border-slate-700"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(500);
                    setSetHours((h) => Math.max(0, h - 1));
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100/60 dark:border-slate-700"
                >
                  -1
                </button>
              </div>
            </div>

            <div className="text-2xl font-light text-slate-300 dark:text-slate-600 mb-6">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                MINUTES
              </span>
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl sm:text-4xl font-light text-slate-900 dark:text-slate-100 shadow-xs">
                {setMinutes.toString().padStart(2, '0')}
              </div>
              <div className="flex gap-1 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(600);
                    setSetMinutes((m) => Math.min(59, m + 1));
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100/60 dark:border-slate-700"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(500);
                    setSetMinutes((m) => Math.max(0, m - 1));
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100/60 dark:border-slate-700"
                >
                  -1
                </button>
              </div>
            </div>

            <div className="text-2xl font-light text-slate-300 dark:text-slate-600 mb-6">:</div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                SECONDS
              </span>
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl sm:text-4xl font-light text-slate-900 dark:text-slate-100 shadow-xs">
                {setSeconds.toString().padStart(2, '0')}
              </div>
              <div className="flex gap-1 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(600);
                    setSetSeconds((s) => Math.min(59, s + 1));
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100/60 dark:border-slate-700"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(500);
                    setSetSeconds((s) => Math.max(0, s - 1));
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100/60 dark:border-slate-700"
                >
                  -1
                </button>
              </div>
            </div>
          </div>

          {/* Quick preset capsules */}
          <div className="flex items-center gap-1.5 my-3">
            {[1, 5, 10, 15, 25, 30].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  soundEngine.playClick(750);
                  setSetMinutes(mins);
                  setSetHours(0);
                  setSetSeconds(0);
                }}
                className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100/80 dark:border-slate-700 transition-colors"
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-4">
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
        <div className="flex flex-col items-center py-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="relative flex items-center justify-center my-2">
            <ThreeTimerRing
              progress={progressFraction}
              status={status}
              size={240}
              enabled3D={enable3D}
            />

            {/* Centered Digital Countdown */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-4xl sm:text-5xl font-mono font-light tracking-tight text-slate-900 dark:text-slate-100">
                {formatTime(remainingSeconds)}
              </span>

              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                {label || 'Timer'}
              </span>

              {status === 'finished' && (
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 animate-bounce">
                  <BellRing className="w-3.5 h-3.5" />
                  Finished
                </div>
              )}
            </div>
          </div>

          {/* Quick +1 Min Button */}
          {status !== 'finished' && (
            <div className="mt-2 mb-4">
              <button
                type="button"
                onClick={handleAddMinute}
                className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-700 flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                +1 min
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs mt-1">
            <button
              id="reset-timer-btn"
              type="button"
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-medium text-xs border border-blue-100 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Reset
            </button>

            {status === 'running' && (
              <button
                id="pause-timer-btn"
                type="button"
                onClick={handlePause}
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98"
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
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume
              </button>
            )}

            {status === 'finished' && (
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-98"
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
      />
    </div>
  );
};
