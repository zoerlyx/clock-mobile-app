export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ...

export type AlarmSound = 'radiance' | 'cosmic' | 'pulse' | 'bell' | 'chime';

export interface Alarm {
  id: string;
  label: string;
  hour: number; // 0-23
  minute: number; // 0-59
  enabled: boolean;
  repeatDays: DayOfWeek[]; // Empty means one-time alarm
  sound: AlarmSound;
  vibration: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorldClockLocation {
  id: string;
  city: string;
  country: string;
  timezone: string; // IANA timezone, e.g. "Asia/Tokyo"
  position: number;
  latitude: number;
  longitude: number;
  createdAt: number;
  updatedAt: number;
}

export interface TimerPreset {
  id: string;
  name: string;
  duration: number; // in seconds
  createdAt: number;
  updatedAt: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface ActiveTimerState {
  duration: number; // total set seconds
  remaining: number; // seconds remaining
  status: TimerStatus;
  startedAt: number | null; // epoch timestamp when resumed/started
  targetEndTime: number | null; // epoch timestamp when it should hit 0
  label: string;
}

export interface LapRecord {
  lapNumber: number;
  lapTime: number; // ms duration of this lap
  totalTime: number; // ms total elapsed at this lap
  timestamp: number;
}

export interface StopwatchState {
  elapsedTime: number; // in milliseconds
  isRunning: boolean;
  startedAt: number | null; // epoch timestamp
  pausedAt: number | null;
  laps: LapRecord[];
}

export type AppTab = 'alarm' | 'world-clock' | 'timer' | 'stopwatch';
