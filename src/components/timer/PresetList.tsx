import React from 'react';
import { Play, Plus, Edit2, Trash2 } from 'lucide-react';
import { TimerPreset } from '../../types';
import { soundEngine } from '../../services/audio';

interface PresetListProps {
  presets: TimerPreset[];
  onSelectPreset: (preset: TimerPreset) => void;
  onAddPreset: () => void;
  onEditPreset: (preset: TimerPreset) => void;
  onDeletePreset: (id: string) => void;
}

export const PresetList: React.FC<PresetListProps> = ({
  presets,
  onSelectPreset,
  onAddPreset,
  onEditPreset,
  onDeletePreset,
}) => {
  const formatDuration = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    if (h > 0) {
      return `${h}h ${m > 0 ? `${m}m` : ''} ${s > 0 ? `${s}s` : ''}`.trim();
    }
    if (m > 0 && s === 0) {
      return `${m}m`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Presets
        </span>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick(800);
            onAddPreset();
          }}
          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {presets.length === 0 ? (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
          No presets saved yet
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                soundEngine.playClick(850);
                onSelectPreset(preset);
              }}
              className="group relative overflow-hidden rounded-3xl p-4 bg-white dark:bg-slate-900 hover:bg-blue-50/30 dark:hover:bg-slate-800/80 border border-slate-100/90 dark:border-slate-800 hover:border-blue-200/80 dark:hover:border-slate-700 cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {preset.name}
                </span>
                <div
                  className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(750);
                      onEditPreset(preset);
                    }}
                    className="p-1 rounded text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(400);
                      onDeletePreset(preset.id);
                    }}
                    className="p-1 rounded text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-mono text-base font-light text-slate-900 dark:text-slate-100">
                  {formatDuration(preset.duration)}
                </span>
                <span className="p-1.5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-colors">
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
