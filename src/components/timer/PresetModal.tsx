import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { TimerPreset } from '../../types';
import { soundEngine } from '../../services/audio';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (presetData: { id?: string; name: string; duration: number }) => void;
  presetToEdit?: TimerPreset | null;
  onDeletePreset?: (id: string) => void;
  initialPreset?: TimerPreset | null;  
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeletePreset, 
  initialPreset,
  presetToEdit,
}) => {
  const [name, setName] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (presetToEdit) {
      setName(presetToEdit.name);
      const totalSec = presetToEdit.duration;
      setHours(Math.floor(totalSec / 3600));
      setMinutes(Math.floor((totalSec % 3600) / 60));
      setSeconds(totalSec % 60);
    } else {
      setName('');
      setHours(0);
      setMinutes(10);
      setSeconds(0);
    }
  }, [presetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const totalDuration = hours * 3600 + minutes * 60 + seconds;
    if (totalDuration <= 0) return;
    soundEngine.playClick(950);
    onSave({
      id: presetToEdit?.id,
      name: name.trim() || `${minutes}m Timer`,
      duration: totalDuration,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="preset-modal-dialog"
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {presetToEdit ? 'Edit Preset' : 'New Preset'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Name */}
        <div className="space-y-1 my-3">
          <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Preset Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Focus, Tea, Rest"
            maxLength={30}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Duration Selectors */}
        <div className="py-3 flex items-center justify-center gap-3">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">HOURS</span>
            <button
              type="button"
              onClick={() => setHours((h) => Math.min(23, h + 1))}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className="w-16 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-2xl text-slate-900 dark:text-slate-100 shadow-xs">
              {hours.toString().padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() => setHours((h) => Math.max(0, h - 1))}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <span className="text-xl text-slate-300 dark:text-slate-600 font-light mt-4">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">MINUTES</span>
            <button
              type="button"
              onClick={() => setMinutes((m) => Math.min(59, m + 1))}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className="w-16 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-2xl text-slate-900 dark:text-slate-100 shadow-xs">
              {minutes.toString().padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() => setMinutes((m) => Math.max(0, m - 1))}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <span className="text-xl text-slate-300 dark:text-slate-600 font-light mt-4">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">SECONDS</span>
            <button
              type="button"
              onClick={() => setSeconds((s) => Math.min(59, s + 1))}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className="w-16 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-mono text-2xl text-slate-900 dark:text-slate-100 shadow-xs">
              {seconds.toString().padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() => setSeconds((s) => Math.max(0, s - 1))}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Preset Action (Hanya muncul jika sedang mengedit preset yang sudah ada) */}
        {initialPreset && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Yakin ingin menghapus preset "${initialPreset.name}"?`)) {
                  soundEngine?.playClick?.(400);
                  if (onDeletePreset) {
                    onDeletePreset(initialPreset.id);
                  }
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-2xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete Preset
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
            disabled={hours === 0 && minutes === 0 && seconds === 0}
            className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-sm shadow-md shadow-blue-500/25 transition-all active:scale-98"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
