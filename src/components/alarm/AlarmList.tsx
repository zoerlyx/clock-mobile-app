import React, { useState } from 'react';
import { Plus, Bell, Sliders, Sun, Moon } from 'lucide-react';
import { Alarm } from '../../types';
import { AlarmItem } from './AlarmItem';
import { AlarmModal } from './AlarmModal';
import { soundEngine } from '../../services/audio';

interface AlarmListProps {
  alarms: Alarm[];
  militaryTime: boolean;
  darkMode?: boolean;
  // PERBAIKAN: Tambahkan tipe parameter event mouse pada handler
  onToggleDarkMode?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSaveAlarm: (alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
  onOpenSettings?: () => void;
}

export const AlarmList: React.FC<AlarmListProps> = ({
  alarms,
  militaryTime,
  darkMode,
  onToggleDarkMode,
  onSaveAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  onOpenSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const activeCount = alarms.filter((a) => a.enabled).length;

  const handleOpenAdd = () => {
    soundEngine.playClick(800);
    setEditingAlarm(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alarm: Alarm) => {
    soundEngine.playClick(800);
    setEditingAlarm(alarm);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 pt-8 pb-32 space-y-4">
      {/* Clean Minimalist Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Alarm
          </h1>
          {activeCount > 0 && (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100/60 dark:border-blue-800/60">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode} // Langsung passing handler karena tipe di interface sudah sesuai
              className="w-9 h-9 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title={darkMode ? "Mode Terang" : "Mode Gelap"}
              aria-label={darkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Pengaturan"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* Clean Blue Add Button */}
          <button
            id="add-alarm-btn"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add
          </button>
        </div>
      </div>

      {/* Alarm list or Empty state */}
      {alarms.length === 0 ? (
        <div className="my-auto py-16 flex flex-col items-center justify-center text-center px-4 rounded-[32px] bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-blue-500 mb-3">
            <Bell className="w-6 h-6 text-blue-500/70 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No Alarms</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Tap add to schedule a new alarm.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Set Alarm
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alarms.map((alarm) => (
            <AlarmItem
              key={alarm.id}
              alarm={alarm}
              militaryTime={militaryTime}
              onToggle={onToggleAlarm}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AlarmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveAlarm}
        onDelete={onDeleteAlarm}
        alarmToEdit={editingAlarm}
        militaryTime={militaryTime}
      />
    </div>
  );
};
