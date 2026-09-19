import React from 'react';
import { Sliders, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../services/audio';

interface TopHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  currentDate: Date;
  militaryTime: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  isMuted,
  onToggleMute,
  onOpenSettings,
  currentDate,
  militaryTime,
}) => {
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  const displayHours = militaryTime ? hours : hours % 12 || 12;
  const hStr = displayHours.toString().padStart(militaryTime ? 2 : 1, '0');
  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');
  const ampm = !militaryTime ? (hours >= 12 ? 'PM' : 'AM') : '';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 pt-5 pb-3.5 bg-white/80 backdrop-blur-xl border-b border-slate-100/90">
      {/* Brand & Monogram in Neo-Apple Style */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-400 via-purple-400 to-sky-400 p-[1px] shadow-[0_4px_12px_rgba(244,63,94,0.18)]">
          <div className="w-full h-full rounded-[15px] bg-white flex items-center justify-center font-bold text-xs text-slate-800">
            CL
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold tracking-tight text-slate-900">Clock</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            OS
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <div className="hidden xs:flex items-baseline font-mono text-xs text-slate-600 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/50 shadow-xs">
          <span>{hStr}:{mStr}:{sStr}</span>
          {ampm && <span className="ml-1 text-[10px] font-sans font-semibold text-slate-400">{ampm}</span>}
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick(600);
            onToggleMute();
          }}
          className="p-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-95"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick(750);
            onOpenSettings();
          }}
          className="p-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-95"
          title="Preferences"
          aria-label="Preferences"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
