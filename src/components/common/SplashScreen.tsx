import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isFadingOut?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Triggers entry animations right after initial mount
    const timer = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Modern Vector Clock Logo with Ambient Glow */}
        <div
          className={`relative flex items-center justify-center transition-all duration-700 ${
            isLoaded 
              ? 'opacity-100 scale-100 blur-0 translate-y-0' 
              : 'opacity-0 scale-85 blur-md translate-y-2'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Soft Background Ambient Glow */}
          <div className="absolute w-36 h-36 rounded-full bg-blue-500/20 dark:bg-blue-500/25 blur-3xl" />

          {/* Icon Canvas */}
          <div className="relative w-28 h-28 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
            {/* Glassmorphism Subtle Highlight */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/40 dark:bg-white/5 rounded-full blur-lg pointer-events-none" />

            <svg
              className="w-14 h-14 text-slate-800 dark:text-slate-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer Ring */}
              <circle cx="12" cy="12" r="9" className="text-slate-300 dark:text-slate-700" />
              
              {/* Hour & Minute Hands with Rotation Animation */}
              <g 
                className="origin-center transition-transform duration-1000 delay-200"
                style={{
                  transform: isLoaded ? 'rotate(0deg)' : 'rotate(-45deg)',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <path d="M12 7v5l3.5 2" className="text-blue-600 dark:text-blue-400" strokeWidth="2.2" />
              </g>
              
              {/* Center Pivot Point */}
              <circle cx="12" cy="12" r="1.2" fill="currentColor" className="text-blue-600 dark:text-blue-400" />
            </svg>
          </div>
        </div>

        {/* App Title with Premium Reveal Animation */}
        <div className="overflow-hidden py-1">
          <h1
            className={`text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 font-sans transition-all duration-700 delay-200 ${
              isLoaded 
                ? 'opacity-100 translate-y-0 blur-0' 
                : 'opacity-0 translate-y-6 blur-sm'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            o<span className="text-blue-600 dark:text-blue-400 font-normal inline-block transition-transform duration-500 delay-300 hover:scale-110">'</span>Clock
          </h1>
        </div>
      </div>
    </div>
  );
};