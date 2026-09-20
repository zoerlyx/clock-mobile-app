export interface CityData {
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
}

export const POPULAR_CITIES: CityData[] = [
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', lat: 51.5074, lng: -0.1278 },
  { city: 'New York', country: 'United States', timezone: 'America/New_York', lat: 40.7128, lng: -74.006 },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', lat: 35.6762, lng: 139.6503 },
  { city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', lat: -6.2088, lng: 106.8456 },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', lat: 48.8566, lng: 2.3522 },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', lat: 25.2048, lng: 55.2708 },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', lat: -33.8688, lng: 151.2093 },
  { city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles', lat: 37.7749, lng: -122.4194 },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', lat: 52.52, lng: 13.405 },
  { city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', lat: 22.3193, lng: 114.1694 },
  { city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', lat: -23.5505, lng: -46.6333 },
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', lat: 30.0444, lng: 31.2357 },
  { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', lat: 19.076, lng: 72.8777 },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', lat: 37.5665, lng: 126.978 },
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', lat: 43.6532, lng: -79.3832 },
  { city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', lat: 13.7563, lng: 100.5018 },
  { city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', lat: 41.9028, lng: 12.4964 },
  { city: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich', lat: 47.3769, lng: 8.5417 },
  { city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', lat: -36.8485, lng: 174.7633 },
  { city: 'Chicago', country: 'United States', timezone: 'America/Chicago', lat: 41.8781, lng: -87.6298 },
  { city: 'Honolulu', country: 'United States', timezone: 'Pacific/Honolulu', lat: 21.3069, lng: -157.8583 },
  { city: 'Reykjavik', country: 'Iceland', timezone: 'Atlantic/Reykjavik', lat: 64.1466, lng: -21.9426 },
  { city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', lat: -26.2041, lng: 28.0473 },
  { city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', lat: -34.6037, lng: -58.3816 },
  { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', lat: 19.4326, lng: -99.1332 },
  { city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', lat: 49.2827, lng: -123.1207 },
  { city: 'Stockholm', country: 'Sweden', timezone: 'Europe/Stockholm', lat: 59.3293, lng: 18.0686 },
  { city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam', lat: 52.3676, lng: 4.9041 },
  { city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', lat: 40.4168, lng: -3.7038 },
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', lat: 41.0082, lng: 28.9784 },
  { city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', lat: 3.139, lng: 101.6869 },
  { city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei', lat: 25.033, lng: 121.5654 },
  { city: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', lat: 24.7136, lng: 46.6753 },
  { city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi', lat: -1.2921, lng: 36.8219 },
  { city: 'Athens', country: 'Greece', timezone: 'Europe/Athens', lat: 37.9838, lng: 23.7275 },
  { city: 'Vienna', country: 'Austria', timezone: 'Europe/Vienna', lat: 48.2082, lng: 16.3738 },
  { city: 'Helsinki', country: 'Finland', timezone: 'Europe/Helsinki', lat: 60.1699, lng: 24.9384 },
  { city: 'Oslo', country: 'Norway', timezone: 'Europe/Oslo', lat: 59.9139, lng: 10.7522 },
  { city: 'Copenhagen', country: 'Denmark', timezone: 'Europe/Copenhagen', lat: 55.6761, lng: 12.5683 },
  { city: 'Dublin', country: 'Ireland', timezone: 'Europe/Dublin', lat: 53.3498, lng: -6.2603 },
  { city: 'Lisbon', country: 'Portugal', timezone: 'Europe/Lisbon', lat: 38.7223, lng: -9.1393 },
  { city: 'Santiago', country: 'Chile', timezone: 'America/Santiago', lat: -33.4489, lng: -70.6693 },
  { city: 'Bogota', country: 'Colombia', timezone: 'America/Bogota', lat: 4.711, lng: -74.0721 },
  { city: 'Lima', country: 'Peru', timezone: 'America/Lima', lat: -12.0464, lng: -77.0428 },
  { city: 'Perth', country: 'Australia', timezone: 'Australia/Perth', lat: -31.9505, lng: 115.8605 },
  { city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', lat: -37.8136, lng: 144.9631 },
  { city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', lat: 31.2304, lng: 121.4737 },
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', lat: 39.9042, lng: 116.4074 },
  { city: 'Delhi', country: 'India', timezone: 'Asia/Kolkata', lat: 28.6139, lng: 77.209 },
  { city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar', lat: 25.2854, lng: 51.531 },
  { city: 'Tel Aviv', country: 'Israel', timezone: 'Asia/Jerusalem', lat: 32.0853, lng: 34.7818 },
  { city: 'Warsaw', country: 'Poland', timezone: 'Europe/Warsaw', lat: 52.2297, lng: 21.0122 },
  { city: 'Prague', country: 'Czechia', timezone: 'Europe/Prague', lat: 50.0755, lng: 14.4378 },
  { city: 'Budapest', country: 'Hungary', timezone: 'Europe/Budapest', lat: 47.4979, lng: 19.0402 },
  { city: 'Manila', country: 'Philippines', timezone: 'Asia/Manila', lat: 14.5995, lng: 120.9842 },
  { city: 'Denver', country: 'United States', timezone: 'America/Denver', lat: 39.7392, lng: -104.9903 },
  { city: 'Anchorage', country: 'United States', timezone: 'America/Anchorage', lat: 61.2181, lng: -149.9003 }
];

export function getUserLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export interface FormattedTimezoneData {
  timeStr: string; // e.g. "09:41"
  amPmStr: string; // e.g. "AM" or "" if 24h
  fullTimeStr: string; // "09:41:32"
  dateStr: string; // e.g. "Sat, Sep 19"
  offsetDiffStr: string; // e.g. "+7 hrs", "-3 hrs", "Same time"
  dayRelativeStr: string; // "Today", "Tomorrow", "Yesterday"
  isDaytime: boolean;
  hours24: number;
  minutes: number;
  seconds: number;
}

export function getTimezoneInfo(timezone: string, referenceDate: Date = new Date()): FormattedTimezoneData {
  try {
    // Current time in specified timezone
    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).formatToParts(referenceDate);

    const hourPart = timeParts.find((p) => p.type === 'hour')?.value || '12';
    const minutePart = timeParts.find((p) => p.type === 'minute')?.value || '00';
    const secondPart = timeParts.find((p) => p.type === 'second')?.value || '00';
    const dayPeriodPart = timeParts.find((p) => p.type === 'dayPeriod')?.value || '';

    // 24-hour hour for isDaytime calculation
    const hour24Parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).formatToParts(referenceDate);
    const hour24Val = parseInt(hour24Parts.find((p) => p.type === 'hour')?.value || '12', 10);
    const minuteVal = parseInt(minutePart, 10);
    const secondVal = parseInt(secondPart, 10);

    const isDaytime = hour24Val >= 6 && hour24Val < 18;

    // Date in target timezone
    const dateStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(referenceDate);

    // Calculate relative day and hours offset compared to local
    const localDay = referenceDate.getDate();
    const targetDayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      day: 'numeric',
    });
    const targetDay = parseInt(targetDayFormatter.format(referenceDate), 10);

    let dayRelativeStr = 'Today';
    if (targetDay > localDay) {
      dayRelativeStr = 'Tomorrow';
    } else if (targetDay < localDay) {
      dayRelativeStr = 'Yesterday';
    }

    // Offset difference in hours
    // Using Intl to find GMT offset of both target and local
    const targetUtcOffset = getUtcOffsetMinutes(timezone, referenceDate);
    const localUtcOffset = -referenceDate.getTimezoneOffset(); // in minutes

    const diffMinutes = targetUtcOffset - localUtcOffset;
    const diffHours = diffMinutes / 60;

    let offsetDiffStr = 'Same time';
    if (diffHours > 0) {
      const formatted = Number.isInteger(diffHours) ? `${diffHours}` : diffHours.toFixed(1);
      offsetDiffStr = `+${formatted} hrs`;
    } else if (diffHours < 0) {
      const formatted = Number.isInteger(Math.abs(diffHours)) ? `${Math.abs(diffHours)}` : Math.abs(diffHours).toFixed(1);
      offsetDiffStr = `-${formatted} hrs`;
    }

    return {
      timeStr: `${hourPart}:${minutePart}`,
      amPmStr: dayPeriodPart.toUpperCase(),
      fullTimeStr: `${hourPart}:${minutePart}:${secondPart}`,
      dateStr,
      offsetDiffStr,
      dayRelativeStr,
      isDaytime,
      hours24: hour24Val,
      minutes: minuteVal,
      seconds: secondVal,
    };
  } catch {
    // Fallback if timezone invalid
    return {
      timeStr: '00:00',
      amPmStr: '',
      fullTimeStr: '00:00:00',
      dateStr: 'Unknown',
      offsetDiffStr: '0 hrs',
      dayRelativeStr: 'Today',
      isDaytime: true,
      hours24: 12,
      minutes: 0,
      seconds: 0,
    };
  }
}

export function getUtcOffsetMinutes(timezone: string, date: Date = new Date()): number {
  try {
    const tzString = date.toLocaleString('en-US', { timeZone: timezone });
    const localDate = new Date(tzString);
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    return Math.round((localDate.getTime() - utcDate.getTime()) / 60000);
  } catch {
    return 0;
  }
}

export function formatUtcOffset(timezone: string, date: Date = new Date()): string {
  const minutes = getUtcOffsetMinutes(timezone, date);
  const sign = minutes >= 0 ? '+' : '-';
  const absMin = Math.abs(minutes);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  if (m === 0) {
    return `UTC${sign}${h}`;
  }
  return `UTC${sign}${h}:${m < 10 ? '0' : ''}${m}`;
}
