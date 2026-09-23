import { 
  Alarm, 
  WorldClockLocation, 
  TimerPreset, 
  ActiveTimerState, 
  StopwatchState 
} from '../types';

const STORAGE_KEYS = {
  ALARMS: 'clock_app_alarms_v1',
  WORLD_CLOCKS: 'clock_app_world_clocks_v1',
  TIMER_PRESETS: 'clock_app_timer_presets_v1',
  ACTIVE_TIMER: 'clock_app_active_timer_v1',
  STOPWATCH: 'clock_app_stopwatch_v1',
  SETTINGS: 'clock_app_settings_v1',
};

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  militaryTime: boolean; // 24-hour vs 12-hour
  enable3DEffects: boolean;
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  militaryTime: false,
  enable3DEffects: true,
  darkMode: false,
};

const DEFAULT_ALARMS: Alarm[] = [
  {
    id: 'alarm-1',
    label: 'Morning Rise',
    hour: 7,
    minute: 0,
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    sound: 'radiance',
    vibration: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'alarm-2',
    label: 'Weekend Coffee',
    hour: 8,
    minute: 30,
    enabled: false,
    repeatDays: [0, 6],
    sound: 'chime',
    vibration: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'alarm-3',
    label: 'Wind Down',
    hour: 22,
    minute: 45,
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    sound: 'bell',
    vibration: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  }
];

const DEFAULT_WORLD_CLOCKS: WorldClockLocation[] = [
  {
    id: 'wc-utc',
    city: 'UTC Reference',
    country: 'Universal Coordinated Time',
    timezone: 'UTC',
    position: 0,
    latitude: 51.4769,
    longitude: 0.0,
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000,
  },
  {
    id: 'wc-tokyo',
    city: 'Tokyo',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    position: 1,
    latitude: 35.6762,
    longitude: 139.6503,
    createdAt: Date.now() - 90000,
    updatedAt: Date.now() - 90000,
  },
  {
    id: 'wc-london',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    position: 2,
    latitude: 51.5074,
    longitude: -0.1278,
    createdAt: Date.now() - 80000,
    updatedAt: Date.now() - 80000,
  },
  {
    id: 'wc-ny',
    city: 'New York',
    country: 'United States',
    timezone: 'America/New_York',
    position: 3,
    latitude: 40.7128,
    longitude: -74.006,
    createdAt: Date.now() - 70000,
    updatedAt: Date.now() - 70000,
  },
  {
    id: 'wc-sf',
    city: 'San Francisco',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    position: 4,
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: Date.now() - 60000,
    updatedAt: Date.now() - 60000,
  }
];

const DEFAULT_TIMER_PRESETS: TimerPreset[] = [
  { id: 'preset-1', name: 'Pomodoro Focus', duration: 25 * 60, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'preset-2', name: 'Short Break', duration: 5 * 60, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'preset-3', name: 'Power Nap', duration: 20 * 60, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'preset-4', name: 'Boiled Egg (Soft)', duration: 6 * 60, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'preset-5', name: 'Tea Steeping', duration: 3 * 60, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'preset-6', name: 'Workout Interval', duration: 90, createdAt: Date.now(), updatedAt: Date.now() },
];

// Helper aman untuk baca/tulis LocalStorage
function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`[Storage] Failed to parse item ${key}:`, e);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[Storage] Failed to set item ${key}:`, e);
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`[Storage] Failed to remove item ${key}:`, e);
  }
}

// ----------------- Alarms CRUD -----------------
export function getAlarms(): Alarm[] {
  return safeGetItem<Alarm[]>(STORAGE_KEYS.ALARMS, DEFAULT_ALARMS);
}

export function saveAlarm(alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Alarm {
  const alarms = getAlarms();
  const now = Date.now();
  let result: Alarm;

  if (alarm.id) {
    const existingIndex = alarms.findIndex((a) => a.id === alarm.id);
    if (existingIndex >= 0) {
      result = {
        ...alarms[existingIndex],
        ...alarm,
        updatedAt: now,
      };
      alarms[existingIndex] = result;
    } else {
      result = {
        ...alarm,
        id: alarm.id,
        createdAt: now,
        updatedAt: now,
      };
      alarms.push(result);
    }
  } else {
    result = {
      ...alarm,
      id: 'alarm-' + Math.random().toString(36).substring(2, 9) + '-' + now,
      createdAt: now,
      updatedAt: now,
    };
    alarms.push(result);
  }

  safeSetItem(STORAGE_KEYS.ALARMS, alarms);
  return result;
}

export function toggleAlarm(id: string): Alarm | null {
  const alarms = getAlarms();
  const index = alarms.findIndex((a) => a.id === id);
  if (index === -1) return null;
  alarms[index].enabled = !alarms[index].enabled;
  alarms[index].updatedAt = Date.now();
  safeSetItem(STORAGE_KEYS.ALARMS, alarms);
  return alarms[index];
}

export function deleteAlarm(id: string): boolean {
  const alarms = getAlarms();
  const filtered = alarms.filter((a) => a.id !== id);
  if (filtered.length !== alarms.length) {
    safeSetItem(STORAGE_KEYS.ALARMS, filtered);
    return true;
  }
  return false;
}

// ----------------- World Clock CRUD -----------------
export function getWorldClocks(): WorldClockLocation[] {
  const list = safeGetItem<WorldClockLocation[]>(STORAGE_KEYS.WORLD_CLOCKS, DEFAULT_WORLD_CLOCKS);
  return list.sort((a, b) => a.position - b.position);
}

export function addWorldClock(city: string, country: string, timezone: string, lat: number, lng: number): WorldClockLocation {
  const list = getWorldClocks();
  const now = Date.now();
  const newLocation: WorldClockLocation = {
    id: 'wc-' + Math.random().toString(36).substring(2, 9) + '-' + now,
    city,
    country,
    timezone,
    position: list.length,
    latitude: lat,
    longitude: lng,
    createdAt: now,
    updatedAt: now,
  };
  list.push(newLocation);
  safeSetItem(STORAGE_KEYS.WORLD_CLOCKS, list);
  return newLocation;
}

export function deleteWorldClock(id: string): boolean {
  const list = getWorldClocks();
  const filtered = list.filter((item) => item.id !== id);
  if (filtered.length !== list.length) {
    filtered.forEach((item, idx) => { 
      item.position = idx;
    });
    safeSetItem(STORAGE_KEYS.WORLD_CLOCKS, filtered);
    return true;
  }
  return false;
}

export function reorderWorldClocks(id: string, direction: 'up' | 'down'): WorldClockLocation[] {
  const list = getWorldClocks();
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return list;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= list.length) return list;

  const temp = list[index];
  list[index] = list[targetIndex];
  list[targetIndex] = temp;

  list.forEach((item, idx) => {
    item.position = idx;
  });

  safeSetItem(STORAGE_KEYS.WORLD_CLOCKS, list);
  return list;
}

// ----------------- Timer Presets CRUD -----------------
export function getTimerPresets(): TimerPreset[] {
  return safeGetItem<TimerPreset[]>(STORAGE_KEYS.TIMER_PRESETS, DEFAULT_TIMER_PRESETS);
}

export function saveTimerPreset(preset: Omit<TimerPreset, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): TimerPreset {
  const presets = getTimerPresets();
  const now = Date.now();
  let result: TimerPreset;

  if (preset.id) {
    const existingIndex = presets.findIndex((p) => p.id === preset.id);
    if (existingIndex >= 0) {
      result = {
        ...presets[existingIndex],
        ...preset,
        updatedAt: now,
      };
      presets[existingIndex] = result;
    } else {
      result = {
        ...preset,
        id: preset.id,
        createdAt: now,
        updatedAt: now,
      };
      presets.push(result);
    }
  } else {
    result = {
      ...preset,
      id: 'preset-' + Math.random().toString(36).substring(2, 9) + '-' + now,
      createdAt: now,
      updatedAt: now,
    };
    presets.push(result);
  }

  safeSetItem(STORAGE_KEYS.TIMER_PRESETS, presets);
  return result;
}

export function deleteTimerPreset(id: string): boolean {
  const presets = getTimerPresets();
  const filtered = presets.filter((p) => p.id !== id);
  if (filtered.length !== presets.length) {
    safeSetItem(STORAGE_KEYS.TIMER_PRESETS, filtered);
    return true;
  }
  return false;
}

// ----------------- Active Timer Session -----------------
export function getStoredActiveTimer(): ActiveTimerState | null {
  return safeGetItem<ActiveTimerState | null>(STORAGE_KEYS.ACTIVE_TIMER, null);
}

export function getActiveTimer(): ActiveTimerState | null {
  const timer = getStoredActiveTimer();
  if (!timer) return null;

  // Jika timer sedang berjalan (running) dan punya targetEndTime
  if (timer.status === 'running' && timer.targetEndTime) {
    const now = Date.now();
    const updatedRemaining = Math.max(0, Math.ceil((timer.targetEndTime - now) / 1000));

    return {
      ...timer,
      remaining: updatedRemaining,
      status: updatedRemaining === 0 ? 'finished' : 'running',
    };
  }

  return timer;
}

export function saveActiveTimer(timerState: ActiveTimerState | null): void {
  if (!timerState) {
    safeRemoveItem(STORAGE_KEYS.ACTIVE_TIMER);
  } else {
    safeSetItem(STORAGE_KEYS.ACTIVE_TIMER, timerState);
  }
}

export function clearActiveTimer(): void {
  safeRemoveItem(STORAGE_KEYS.ACTIVE_TIMER);
}

// ----------------- Stopwatch Session -----------------
export function getStoredStopwatch(): StopwatchState | null {
  return safeGetItem<StopwatchState | null>(STORAGE_KEYS.STOPWATCH, null);
}

export function getActiveStopwatch(): StopwatchState | null {
  const savedState = getStoredStopwatch();
  if (!savedState) return null;

  // Jika stopwatch ditinggalkan dalam keadaan running, hitung selisih waktu terlewat
  if (savedState.isRunning && savedState.startedAt) {
    const now = Date.now();
    const additionalTime = Math.max(0, now - savedState.startedAt);

    return {
      ...savedState,
      elapsedTime: savedState.elapsedTime + additionalTime,
      startedAt: now, // Atur ulang timestamp awal ke sekarang setelah dihitung
    };
  }

  return savedState;
}

export function saveActiveStopwatch(state: StopwatchState | null): void {
  if (!state) {
    safeRemoveItem(STORAGE_KEYS.STOPWATCH);
  } else {
    safeSetItem(STORAGE_KEYS.STOPWATCH, state);
  }
}

export function clearActiveStopwatch(): void {
  safeRemoveItem(STORAGE_KEYS.STOPWATCH);
}

// ----------------- Settings -----------------
export function getSettings(): AppSettings {
  return safeGetItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  safeSetItem(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// ----------------- Utilities & Synchronization -----------------
export function resetAllStorageData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => safeRemoveItem(key));
}

export function subscribeToStorageChanges(callback: (key: string) => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key && Object.values(STORAGE_KEYS).includes(event.key)) {
      callback(event.key);
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
