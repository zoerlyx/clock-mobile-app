import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppTab, Alarm, WorldClockLocation, TimerPreset, ActiveTimerState, StopwatchState } from './types';
import {
  getAlarms,
  saveAlarm,
  toggleAlarm,
  deleteAlarm,
  getWorldClocks,
  addWorldClock,
  deleteWorldClock,
  reorderWorldClocks,
  getTimerPresets,
  saveTimerPreset,
  deleteTimerPreset,
  getStoredActiveTimer,
  getStoredStopwatch,
  getSettings,
  updateSettings,
  AppSettings,
} from './services/storage';
import { CityData } from './services/timezones';
import { soundEngine } from './services/audio';
import { NotificationManager } from './services/notifications';

import { SplashScreen } from './components/common/SplashScreen';
import { BottomNav } from './components/layout/BottomNav';
import { SettingsModal } from './components/layout/SettingsModal';
import { AlarmList } from './components/alarm/AlarmList';
import { ActiveAlarmAlert } from './components/alarm/ActiveAlarmAlert';
import { WorldClockList } from './components/world-clock/WorldClockList';
import { TimerDisplay } from './components/timer/TimerDisplay';
import { StopwatchDisplay } from './components/stopwatch/StopwatchDisplay';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('alarm');

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const [alarms, setAlarms] = useState<Alarm[]>(() => getAlarms());
  const [worldClocks, setWorldClocks] = useState<WorldClockLocation[]>(() => getWorldClocks());
  const [timerPresets, setTimerPresets] = useState<TimerPreset[]>(() => getTimerPresets());
  
  // Tambahkan setter agar indikator di BottomNav sinkron
  const [activeTimerState, setActiveTimerState] = useState<ActiveTimerState | null>(() => getStoredActiveTimer());
  const [stopwatchState, setStopwatchState] = useState<StopwatchState | null>(() => getStoredStopwatch());
  
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const snoozeTargetRef = useRef<{ alarm: Alarm; epoch: number } | null>(null);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const lastTriggeredTimeRef = useRef<string>('');

  // 1. Cleanup Splash Screen yang Aman
  useEffect(() => {
    let removeTimerId: NodeJS.Timeout;

    const splashTimerId = setTimeout(() => {
      setIsFadingOut(true);
      removeTimerId = setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }, 1800);

    return () => {
      clearTimeout(splashTimerId);
      if (removeTimerId) clearTimeout(removeTimerId);
    };
  }, []);

  // Handler Trigger Alarm
  const triggerAlarmAlert = useCallback((alarm: Alarm) => {
    setRingingAlarm(alarm);
    soundEngine.startAlarmSound(alarm.sound, alarm.vibration && settings.vibrationEnabled);

    NotificationManager.sendNotification(`ALARM: ${alarm.label || 'Alarm'}`, {
      body: `${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`,
    });
  }, [settings.vibrationEnabled]);

  const handleToggleAlarm = useCallback((id: string) => {
    toggleAlarm(id);
    setAlarms(getAlarms());
  }, []);

  // 2. Loop Detik Utama & Pengecekan Alarm
  useEffect(() => {
    const timerId = window.setInterval(() => {
      const now = new Date();
      setCurrentDate(now);

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      const currentDayOfWeek = now.getDay();
      const timeKey = `${now.toDateString()}_${currentHour}:${currentMinute}`;

      // Cek Snooze
      if (snoozeTargetRef.current && now.getTime() >= snoozeTargetRef.current.epoch) {
        const al = snoozeTargetRef.current.alarm;
        snoozeTargetRef.current = null;
        triggerAlarmAlert(al);
        return;
      }

      // Cek Alarm Aktif (Toleransi 5 detik pertama menit untuk mengantisipasi keterlambatan thread)
      if (currentSecond < 5 && lastTriggeredTimeRef.current !== timeKey) {
        for (const alarm of alarms) {
          if (!alarm.enabled) continue;

          if (alarm.hour === currentHour && alarm.minute === currentMinute) {
            lastTriggeredTimeRef.current = timeKey;

            if (alarm.repeatDays && alarm.repeatDays.length > 0) {
              if (alarm.repeatDays.includes(currentDayOfWeek as any)) {
                triggerAlarmAlert(alarm);
                break;
              }
            } else {
              triggerAlarmAlert(alarm);
              handleToggleAlarm(alarm.id); // Matikan alarm sekali pakai
              break;
            }
          }
        }
      }
    }, 1000);

    const handleWake = () => {
      setCurrentDate(new Date());
    };

    window.addEventListener('focus', handleWake);
    document.addEventListener('visibilitychange', handleWake);

    return () => {
      clearInterval(timerId);
      window.removeEventListener('focus', handleWake);
      document.removeEventListener('visibilitychange', handleWake);
    };
  }, [alarms, triggerAlarmAlert, handleToggleAlarm]);

  const handleDismissAlarm = () => {
    soundEngine.stopAlarmSound();
    setRingingAlarm(null);
  };

  const handleSnoozeAlarm = (minutes: number) => {
    if (!ringingAlarm) return;
    soundEngine.stopAlarmSound();
    const targetEpoch = Date.now() + minutes * 60 * 1000;
    snoozeTargetRef.current = {
      alarm: ringingAlarm,
      epoch: targetEpoch,
    };
    setRingingAlarm(null);
  };

  const handleSaveAlarm = (data: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    saveAlarm(data);
    setAlarms(getAlarms());
    NotificationManager.requestPermission();
  };

  const handleDeleteAlarm = (id: string) => {
    deleteAlarm(id);
    setAlarms(getAlarms());
  };

  const handleAddCity = (city: CityData) => {
    addWorldClock(city.city, city.country, city.timezone, city.lat, city.lng);
    setWorldClocks(getWorldClocks());
  };

  const handleDeleteWorldClock = (id: string) => {
    deleteWorldClock(id);
    setWorldClocks(getWorldClocks());
  };

  const handleMoveUpWorldClock = (id: string) => {
    const reordered = reorderWorldClocks(id, 'up');
    setWorldClocks([...reordered]);
  };

  const handleMoveDownWorldClock = (id: string) => {
    const reordered = reorderWorldClocks(id, 'down');
    setWorldClocks([...reordered]);
  };

  const handleSaveTimerPreset = (presetData: { id?: string; name: string; duration: number }) => {
    saveTimerPreset(presetData);
    setTimerPresets(getTimerPresets());
  };

  const handleDeleteTimerPreset = (id: string) => {
    deleteTimerPreset(id);
    setTimerPresets(getTimerPresets());
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = updateSettings(partial);
    setSettings(updated);
    if ('soundEnabled' in partial && partial.soundEnabled !== undefined) {
      soundEngine.setMuted(!partial.soundEnabled);
    }
  };

  // 1. Dihapus/Disesuaikan: useEffect ini tidak perlu mengurus class 'dark' lagi 
// karena penambahan class 'dark' akan ditangani langsung oleh View Transition.
useEffect(() => {
  // Hanya gunakan ini jika aplikasi pertama kali dimuat (initial render)
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, []); // Jalankan sekali saja di awal (mount)

// 2. Buat fungsi Toggle Dark Mode khusus yang mendukung View Transition & koordinat klik
const handleToggleDarkMode = (e?: React.MouseEvent<HTMLButtonElement>) => {
  // Tangkap koordinat klik tombol, jika tidak ada fallback ke tengah layar
  if (e) {
    document.documentElement.style.setProperty('--x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--y', `${e.clientY}px`);
  } else {
    document.documentElement.style.setProperty('--x', '50%');
    document.documentElement.style.setProperty('--y', '50%');
  }

  const nextDarkMode = !settings.darkMode;

  // Jalankan View Transition jika didukung browser
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      if (nextDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      handleUpdateSettings({ darkMode: nextDarkMode });
    });
  } else {
    // Fallback jika browser belum mendukung View Transition
    if (nextDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    handleUpdateSettings({ darkMode: nextDarkMode });
  }
};

const activeAlarmCount = alarms.filter((a) => a.enabled).length;

return (
  <div className={`${settings.darkMode ? 'dark' : ''} min-h-screen w-full bg-gradient-to-br from-[#eef2f7] via-[#f5f8fc] to-[#e6ecf4] dark:from-[#080d1a] dark:via-[#0c1322] dark:to-[#090f1d] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-0 sm:p-6 relative overflow-x-hidden transition-colors duration-300`}>
    {/* Background Reflections */}
    <div className="fixed top-12 left-1/4 w-96 h-96 rounded-full bg-blue-200/30 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
    <div className="fixed bottom-12 right-1/4 w-96 h-96 rounded-full bg-sky-200/25 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

    {/* Main Container */}
    <main
      id="clock-mobile-app"
      className="w-full sm:max-w-[430px] h-screen sm:h-[860px] flex flex-col bg-white dark:bg-slate-950 sm:rounded-[46px] border-0 sm:border-[10px] sm:border-white sm:dark:border-slate-900 ring-0 sm:ring-1 sm:ring-slate-900/5 sm:dark:ring-slate-800 shadow-none sm:shadow-[0_25px_70px_-15px_rgba(15,23,42,0.12),0_10px_30px_-5px_rgba(15,23,42,0.06)] dark:sm:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 transition-colors duration-300"
    >
      {showSplash && <SplashScreen isFadingOut={isFadingOut} />}
      
      {/* Tab View */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-slate-950">
        {currentTab === 'alarm' && (
          <AlarmList
            alarms={alarms}
            militaryTime={settings.militaryTime}
            darkMode={settings.darkMode}
            onToggleDarkMode={handleToggleDarkMode} // <-- 3. Pass fungsi khusus yang baru di sini
            onSaveAlarm={handleSaveAlarm}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentTab === 'world-clock' && (
          <WorldClockList
            locations={worldClocks}
            currentDate={currentDate}
            militaryTime={settings.militaryTime}
            enable3D={settings.enable3DEffects}
            onAddCity={handleAddCity}
            onDeleteLocation={handleDeleteWorldClock}
            onMoveUp={handleMoveUpWorldClock}
            onMoveDown={handleMoveDownWorldClock}
          />
        )}

          {currentTab === 'timer' && (
            <TimerDisplay
              initialState={activeTimerState}
              presets={timerPresets}
              enable3D={settings.enable3DEffects}
              onSavePreset={handleSaveTimerPreset}
              onDeletePreset={handleDeleteTimerPreset}
              onStateChange={setActiveTimerState}
            />
          )}

          {currentTab === 'stopwatch' && (
            <StopwatchDisplay
              initialState={stopwatchState}
              enable3D={settings.enable3DEffects}
              onStateChange={setStopwatchState}
            />
          )}
        </div>

        {/* Floating Bottom Dock Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          activeAlarmCount={activeAlarmCount}
          isTimerRunning={activeTimerState?.status === 'running'}
          isStopwatchRunning={stopwatchState?.isRunning || false}
        />

        {/* Preferences Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />

        {/* Ringing Alarm Overlay */}
        <ActiveAlarmAlert
          alarm={ringingAlarm}
          onDismiss={handleDismissAlarm}
          onSnooze={handleSnoozeAlarm}
        />
      </main>
    </div>
  );
}
