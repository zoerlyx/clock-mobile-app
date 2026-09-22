import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Check, Trash2 } from 'lucide-react';
import { Alarm, DayOfWeek } from '../../types';
import { soundEngine } from '../../services/audio';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  alarmToEdit?: Alarm | null;
  militaryTime: boolean;
}

const SOUND_OPTIONS: { id: Alarm['sound']; label: string }[] = [
  { id: 'chime', label: 'Chime' },
  { id: 'radiance', label: 'Radiance' },
  { id: 'cosmic', label: 'Cosmic' },
  { id: 'bell', label: 'Zen Bell' },
  { id: 'pulse', label: 'Pulse' },
];

const DAYS: { day: DayOfWeek; short: string }[] = [
  { day: 0, short: 'Sun' },
  { day: 1, short: 'Mon' },
  { day: 2, short: 'Tue' },
  { day: 3, short: 'Wed' },
  { day: 4, short: 'Thu' },
  { day: 5, short: 'Fri' },
  { day: 6, short: 'Sat' },
];

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  alarmToEdit,
  militaryTime,
}) => {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>([]);
  const [sound, setSound] = useState<Alarm['sound']>('radiance');
  const [vibration, setVibration] = useState(true);

  useEffect(() => {
    if (alarmToEdit) {
      const h24 = alarmToEdit.hour;
      if (militaryTime) {
        setHour(h24);
      } else {
        const isAfternoon = h24 >= 12;
        setIsPM(isAfternoon);
        setHour(h24 % 12 || 12);
      }
      setMinute(alarmToEdit.minute);
      setLabel(alarmToEdit.label);
      setRepeatDays(alarmToEdit.repeatDays || []);
      setSound(alarmToEdit.sound);
      setVibration(alarmToEdit.vibration);
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const h24 = now.getHours();
      if (militaryTime) {
        setHour(h24);
      } else {
        setIsPM(h24 >= 12);
        setHour(h24 % 12 || 12);
      }
      setMinute(0);
      setLabel('Alarm');
      setRepeatDays([]);
      setSound('radiance');
      setVibration(true);
    }
  }, [alarmToEdit, isOpen, militaryTime]);

  if (!isOpen) return null;

  const handleToggleDay = (day: DayOfWeek) => {
    soundEngine.playClick(750);
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    soundEngine.playClick(900);
    let finalHour = hour;
    if (!militaryTime) {
      if (isPM && hour < 12) finalHour = hour + 12;
      else if (!isPM && hour === 12) finalHour = 0;
    }

    onSave({
      id: alarmToEdit?.id,
      hour: finalHour,
      minute,
      label: label.trim() || 'Alarm',
      enabled: true,
      repeatDays: repeatDays.length > 0 ? repeatDays : [],
      sound,
      vibration,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="alarm-modal-dialog"
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {alarmToEdit ? 'Edit Alarm' : 'New Alarm'}
          </h2>
          <div className="flex items-center gap-1.5">
            {alarmToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(400);
                  onDelete(alarmToEdit.id);
                  onClose();
                }}
                className="p-1.5 rounded-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Hapus Alarm"
                aria-label="Hapus Alarm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="py-4 space-y-4 overflow-y-auto">
          {/* Time Picker Columns */}
          <div className="py-2 flex items-center justify-center gap-3">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(600);
                  const maxH = militaryTime ? 23 : 12;
                  const minH = militaryTime ? 0 : 1;
                  setHour((h) => (h >= maxH ? minH : h + 1));
                }}
                className="p-1 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="w-18 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl font-light text-slate-900 dark:text-slate-100 shadow-xs">
                {hour.toString().padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(600);
                  const maxH = militaryTime ? 23 : 12;
                  const minH = militaryTime ? 0 : 1;
                  setHour((h) => (h <= minH ? maxH : h - 1));
                }}
                className="p-1 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <span className="text-2xl font-light text-slate-300 dark:text-slate-600 -mt-2">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(600);
                  setMinute((m) => (m >= 59 ? 0 : m + 1));
                }}
                className="p-1 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="w-18 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-3xl font-light text-slate-900 dark:text-slate-100 shadow-xs">
                {minute.toString().padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(600);
                  setMinute((m) => (m <= 0 ? 59 : m - 1));
                }}
                className="p-1 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* AM / PM Segmented Control */}
            {!militaryTime && (
              <div className="flex flex-col gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(700);
                    setIsPM(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                    !isPM
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(700);
                    setIsPM(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                    isPM
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700'
                  }`}
                >
                  PM
                </button>
              </div>
            )}
          </div>

          {/* Label Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Work, Morning Run"
              className="w-full px-4 py-2.5 mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Repeat Days Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Repeat Days
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map(({ day, short }) => {
                const isActive = repeatDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`py-2 mt-4 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50/70 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Profile Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tone
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SOUND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playAlarmSoundOnce(opt.id);
                    setSound(opt.id);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    sound === opt.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50/70 dark:bg-slate-800 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {sound === opt.id && <Check className="w-3 h-3 ml-1 shrink-0" />}
                </button>
              ))}
            </div>
          </div> 
        </div>

        {/* Modal Bottom Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="py-3 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-700 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/25 transition-all active:scale-98"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
