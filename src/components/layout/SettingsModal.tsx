import React, { useState, useEffect } from 'react';
import { X, Volume2, Smartphone, Clock, Sparkles, Bell, Check, ShieldAlert, Moon } from 'lucide-react';
import { AppSettings } from '../../services/storage';
import { NotificationManager } from '../../services/notifications';
import { soundEngine } from '../../services/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [notifPermission, setNotifPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // MODIFIKASI: Menerima event mouse 'e' untuk menangkap koordinat klik
  const handleToggleDarkMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.playClick(800);
    
    // Set posisi x dan y dari titik switch yang diklik
    document.documentElement.style.setProperty('--x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--y', `${e.clientY}px`);

    const nextDarkMode = !settings.darkMode;

    // Jika browser mendukung View Transitions, bungkus update state & class dark
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        if (nextDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        onUpdateSettings({ darkMode: nextDarkMode });
      });
    } else {
      // Fallback untuk browser lama
      if (nextDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      onUpdateSettings({ darkMode: nextDarkMode });
    }
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    soundEngine.setMuted(!next);
    soundEngine.playClick(800);
    onUpdateSettings({ soundEnabled: next });
  };

  const handleToggleVibration = () => {
    soundEngine.playClick(800);
    onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled });
  };

  const handleToggle24h = () => {
    soundEngine.playClick(800);
    onUpdateSettings({ militaryTime: !settings.militaryTime });
  };

  const handleToggle3D = () => {
    soundEngine.playClick(800);
    onUpdateSettings({ enable3DEffects: !settings.enable3DEffects });
  };

  const handleRequestNotifications = async () => {
    soundEngine.playClick(900);
    const granted = await NotificationManager.requestPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
    if (granted) {
      NotificationManager.sendNotification('Notifications Enabled', {
        body: 'Alarms will alert you on time.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="settings-modal-dialog"
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Preferences</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 overflow-y-auto">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-xs">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Mode Gelap</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">Tampilan ramah mata</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.darkMode}
              onClick={handleToggleDarkMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                settings.darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications Card */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Notifications</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">Background alerts</div>
              </div>
            </div>

            {notifPermission === 'granted' ? (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium flex items-center gap-1 border border-blue-200/60 dark:border-blue-800/60">
                <Check className="w-3 h-3" /> Active
              </span>
            ) : notifPermission === 'denied' ? (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                <ShieldAlert className="w-3 h-3" /> Blocked
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestNotifications}
                className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs"
              >
                Allow
              </button>
            )}
          </div>

          {/* 24h Toggle */}
          <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">24-Hour Time</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.militaryTime}
              onClick={handleToggle24h}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                settings.militaryTime ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  settings.militaryTime ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Audio Toggle */}
          <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Audio Chimes</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.soundEnabled}
              onClick={handleToggleSound}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Vibration</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.vibrationEnabled}
              onClick={handleToggleVibration}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                settings.vibrationEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3D Visual Effects */}
          <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">3D Visuals</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.enable3DEffects}
              onClick={handleToggle3D}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                settings.enable3DEffects ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  settings.enable3DEffects ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-500/25 transition-all active:scale-98 cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
