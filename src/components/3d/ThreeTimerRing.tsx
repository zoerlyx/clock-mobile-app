import React from 'react';

interface ThreeTimerRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  status: 'idle' | 'running' | 'paused' | 'finished';
  enabled3D?: boolean;
}

export const ThreeTimerRing: React.FC<ThreeTimerRingProps> = ({
  progress,
  size = 240,
  strokeWidth = 9,
  status,
  enabled3D = true,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference - clampedProgress * circumference;

  const getStatusColors = () => {
    switch (status) {
      case 'finished':
        return {
          stroke: '#2563eb',
          glow: 'rgba(37, 99, 235, 0.35)',
          gradientId: 'timerGradFinish',
          from: '#60a5fa',
          to: '#1d4ed8',
        };
      case 'paused':
        return {
          stroke: '#60a5fa',
          glow: 'rgba(96, 165, 250, 0.25)',
          gradientId: 'timerGradPaused',
          from: '#93c5fd',
          to: '#3b82f6',
        };
      case 'running':
      default:
        return {
          stroke: '#2563eb',
          glow: 'rgba(37, 99, 235, 0.35)',
          gradientId: 'timerGradRunning',
          from: '#60a5fa',
          to: '#2563eb',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center select-none"
    >
      {/* Claymorphic backdrop circle - Adaptive Light & Dark */}
      <div
        className="absolute inset-2 rounded-full bg-gradient-to-b from-white/90 to-slate-50/80 dark:from-slate-800/90 dark:to-slate-900/90 border border-white/80 dark:border-slate-700/60 shadow-[0_12px_32px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.05)] pointer-events-none transition-colors duration-300"
        style={
          enabled3D
            ? {
                boxShadow: `0 16px 36px -8px ${colors.glow}, 0 6px 18px rgba(0,0,0,0.2)`,
              }
            : undefined
        }
      />

      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center filter drop-shadow-sm relative z-10"
      >
        <defs>
          <linearGradient id={colors.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>

        {/* Outer subtle decorative ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth / 2 + 3}
          fill="none"
          strokeWidth="1"
          strokeDasharray="3 4"
          className="stroke-slate-200 dark:stroke-slate-800 transition-colors duration-300"
        />

        {/* Base Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"  
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="stroke-slate-200/80 dark:stroke-slate-800/80 transition-colors duration-300"
        />

        {/* Dynamic Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${colors.gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-linear"
        />
      </svg>
    </div>
  );
};
