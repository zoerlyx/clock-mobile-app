import React from 'react';
import { Bell, Globe, Timer, Watch } from 'lucide-react';
import { AppTab } from '../../types';


interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeAlarmCount: number;
  isTimerRunning: boolean;
  isStopwatchRunning: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  activeAlarmCount,
  isTimerRunning,
  isStopwatchRunning,
}) => {
  const tabs: { id: AppTab; label: string; icon: React.FC<{ className?: string }>; badge?: React.ReactNode }[] = [
    {
      id: 'alarm',
      label: 'Alarm',
      icon: Bell,
      badge: activeAlarmCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900">
          {activeAlarmCount}
        </span>
      ) : null,
    },
    {
      id: 'world-clock',
      label: 'World',
      icon: Globe,
    },
    {
      id: 'timer',
      label: 'Timer',
      icon: Timer,
      badge: isTimerRunning ? (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 animate-ping" />
      ) : null,
    },
    {
      id: 'stopwatch',
      label: 'Stopwatch',
      icon: Watch,
      badge: isStopwatchRunning ? (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 animate-ping" />
      ) : null,
    },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto px-5 pb-5 pt-2 pointer-events-none">
      <nav
        id="bottom-navigation-bar"
        aria-label="Navigasi Utama"
        className="pointer-events-auto h-20 bg-white/92 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/10 shadow-[0_16px_40px_-8px_rgba(15,23,42,0.14),0_6px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] px-3 rounded-full flex items-center justify-around transition-colors duration-300"
      >
        {tabs.map(({ id, label, icon: Icon, badge }) => {
          const isActive = currentTab === id;

          return (
            <button
              key={id}
              id={`nav-tab-${id}`}
              type="button"
              aria-label={label}
            
              title={label}
              onClick={() => {
                
                onSelectTab(id);
              }}
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.32)] scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-7 h-7 transition-all ${isActive ? 'stroke-[2.2]' : 'stroke-[1.85]'}`} />
                {badge}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
