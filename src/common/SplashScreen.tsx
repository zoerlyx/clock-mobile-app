import React from 'react';
import { Clock } from 'lucide-react';

interface SplashScreenProps {
  isFadingOut?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut = false }) => {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-slate-900 text-white p-8 transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Spacer Atas */}
      <div />

      {/* Konten Utama (Logo & Brand) */}
      <div className="flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-700">
        <div className="relative">
          {/* Efek Glow di Belakang Icon */}
          <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <Clock className="w-10 h-10 text-white animate-bounce-slow" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Smart Alarm
          </h1>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">
            Your Personal Time Assistant
          </p>
        </div>
      </div>

      {/* Footer / Indicator */}
      <div className="flex flex-col items-center space-y-3 pb-4">
        {/* Spinner Loading Tipis */}
        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-[11px] font-medium text-slate-500">
          Loading assets...
        </span>
      </div>
    </div>
  );
};