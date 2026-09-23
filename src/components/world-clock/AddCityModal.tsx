import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { POPULAR_CITIES, CityData, getTimezoneInfo, formatUtcOffset } from '../../services/timezones';
import { WorldClockLocation } from '../../types';
import { soundEngine } from '../../services/audio';

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCity: (city: CityData) => void;
  existingLocations: WorldClockLocation[];
}

export const AddCityModal: React.FC<AddCityModalProps> = ({
  isOpen,
  onClose,
  onAddCity,
  existingLocations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const existingTimezones = useMemo(() => {
    return new Set(existingLocations.map((l) => l.timezone + '_' + l.city));
  }, [existingLocations]);

  const filteredCities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return POPULAR_CITIES;
    return POPULAR_CITIES.filter(
      (c) =>
        c.city.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query) ||
        c.timezone.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (city: CityData) => {
    const key = city.timezone + '_' + city.city;
    if (existingTimezones.has(key)) return;
    soundEngine.playClick(900);
    onAddCity(city);
    onClose();
  };

  const now = new Date();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="add-city-modal-dialog"
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Choose City</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative my-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city or country..."
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Cities */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px]">
          {filteredCities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              No cities found
            </div>
          ) : (
            filteredCities.map((city) => {
              const key = city.timezone + '_' + city.city;
              const isAdded = existingTimezones.has(key);
              const info = getTimezoneInfo(city.timezone, now);
              const utcOffset = formatUtcOffset(city.timezone, now);

              return (
                <div
                  key={key}
                  onClick={() => handleSelect(city)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isAdded
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-50 cursor-default'
                      : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 hover:bg-blue-50/30 dark:hover:bg-slate-800 shadow-xs cursor-pointer'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {city.city}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{city.country}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{utcOffset}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {/* Jam Digital */}
                      <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                        {info.timeStr} {info.amPmStr}
                      </div>
                      {/* Selisih Waktu */}
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {info.offsetDiffStr}
                      </div>
                    </div>

                    {isAdded ? (
                      <span className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-full bg-blue-600 text-white shadow-xs">
                        <Plus className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
