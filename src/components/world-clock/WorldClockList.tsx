import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { WorldClockLocation } from '../../types';
import { WorldClockItem } from './WorldClockItem';
import { AddCityModal } from './AddCityModal';
import { ThreeGlobe } from '../3d/ThreeGlobe';
import { getUserLocalTimezone, getTimezoneInfo, CityData } from '../../services/timezones';
import { soundEngine } from '../../services/audio';

interface WorldClockListProps {
  locations: WorldClockLocation[];
  currentDate: Date;
  militaryTime: boolean;
  enable3D: boolean;
  onAddCity: (city: CityData) => void;
  onDeleteLocation: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export const WorldClockList: React.FC<WorldClockListProps> = ({
  locations,
  currentDate,
  militaryTime,
  enable3D,
  onAddCity,
  onDeleteLocation,
  onMoveUp,
  onMoveDown,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const localTimezone = getUserLocalTimezone();
  const localInfo = getTimezoneInfo(localTimezone, currentDate);

  let localDisplayTime = localInfo.timeStr;
  if (militaryTime) {
    localDisplayTime = `${localInfo.hours24.toString().padStart(2, '0')}:${localInfo.minutes.toString().padStart(2, '0')}`;
  }

  const handleOpenAdd = () => {
    soundEngine.playClick(800);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 pt-8 pb-32 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          World Clock
        </h1>

        <button
          id="add-world-clock-btn"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm shadow-blue-500/25 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add City
        </button>
      </div>

<div
  id="local-time-card"
  className="relative overflow-hidden rounded-[32px] p-24 bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-100/60 dark:border-slate-800 shadow-[0_12px_36px_rgba(37,99,235,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
>
  {/* Baris Atas Horizontal: Kiri (Icon + Local Time) | Kanan (Tanggal) */}
  <div className="flex items-center justify-between w-full pb-4">
    <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>Local Time</span>
    </div>

    <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800 text-blue-800 dark:text-blue-300 border border-blue-100/80 dark:border-slate-700 shadow-xs">
      {localInfo.dateStr}
    </span>
  </div>

  {/* Baris Bawah: Grid 2 Kolom (2/3 dan 1/3) */}
  <div className="grid grid-cols-3 items-center gap-4 pt-2 border-t border-blue-100/40 dark:border-slate-800/60">
    {/* Kolom Kiri (2/3): Jam dan Menit */}
    <div className="col-span-2 flex items-baseline">
      <span className="text-4xl sm:text-5xl font-light font-mono text-slate-900 dark:text-slate-100 tracking-tight leading-none">
        {localDisplayTime}
      </span>
    </div>

    {/* Kolom Kanan (1/3): Terbagi 2 secara vertikal */}
    <div className="col-span-1 flex flex-col justify-center items-end text-right space-y-1">
      {/* Atas: Nama Kota / Timezone */}
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-full">
        {localTimezone.split('/').pop()?.replace(/_/g, ' ')}
      </span>

      {/* Bawah: Detik & AM/PM */}
      <div className="flex items-baseline justify-end gap-1">
        <span className="text-sm font-mono text-slate-400 dark:text-slate-500 font-medium">
          :{localInfo.seconds.toString().padStart(2, '0')}
        </span>
        {!militaryTime && (
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
            {localInfo.amPmStr}
          </span>
        )}
      </div>
    </div>
  </div>
</div>

      {/* 3D Pearl-White Globe */}
      <div className="py-1 flex flex-col items-center justify-center">
        <ThreeGlobe
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={(id) => setSelectedLocationId(id)}
          size={230}
          enabled={enable3D}
        />
      </div>

      {/* Saved Cities List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Locations ({locations.length})
          </span>
        </div>

        {locations.map((loc, idx) => (
          <WorldClockItem
            key={loc.id}
            location={loc}
            currentDate={currentDate}
            militaryTime={militaryTime}
            isFirst={idx === 0}
            isLast={idx === locations.length - 1}
            isSelected={loc.id === selectedLocationId}
            onSelect={(id) => {
              soundEngine.playClick(650);
              setSelectedLocationId(id === selectedLocationId ? null : id);
            }}
            onMoveUp={(id) => {
              soundEngine.playClick(700);
              onMoveUp(id);
            }}
            onMoveDown={(id) => {
              soundEngine.playClick(600);
              onMoveDown(id);
            }}
            onDelete={(id) => {
              soundEngine.playClick(450);
              onDeleteLocation(id);
            }}
          />
        ))}
      </div>

      {/* Add City Modal */}
      <AddCityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCity={onAddCity}
        existingLocations={locations}
      />
    </div>
  );
};
