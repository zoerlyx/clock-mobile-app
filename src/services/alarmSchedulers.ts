import { Alarm, DayOfWeek } from '../types';

export function getNextAlarmOccurrence(alarm: Alarm, referenceDate: Date = new Date()): Date | null {
  if (!alarm.enabled) return null;

  const currentDayOfWeek = referenceDate.getDay() as DayOfWeek;
  const currentHour = referenceDate.getHours();
  const currentMinute = referenceDate.getMinutes();
  const currentSecond = referenceDate.getSeconds();

  // If one-time alarm (no repeatDays selected)
  if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
    const target = new Date(referenceDate.getTime());
    target.setHours(alarm.hour, alarm.minute, 0, 0);

    // If target time today has already passed, schedule for tomorrow
    if (
      alarm.hour < currentHour ||
      (alarm.hour === currentHour && alarm.minute <= currentMinute)
    ) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  // Recurring alarm: check days starting today through next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const candidateDay = ((currentDayOfWeek + dayOffset) % 7) as DayOfWeek;
    if (alarm.repeatDays.includes(candidateDay)) {
      // Check if time today has not passed yet, or if it's a future day
      if (dayOffset > 0) {
        const target = new Date(referenceDate.getTime());
        target.setDate(target.getDate() + dayOffset);
        target.setHours(alarm.hour, alarm.minute, 0, 0);
        return target;
      } else {
        // Today
        if (
          alarm.hour > currentHour ||
          (alarm.hour === currentHour && alarm.minute > currentMinute) ||
          (alarm.hour === currentHour && alarm.minute === currentMinute && currentSecond < 2)
        ) {
          const target = new Date(referenceDate.getTime());
          target.setHours(alarm.hour, alarm.minute, 0, 0);
          return target;
        }
      }
    }
  }

  // If none found in 7 days (e.g. today after time with only today repeating), schedule next week on that day
  const firstMatchingDay = alarm.repeatDays[0];
  let daysUntil = (firstMatchingDay - currentDayOfWeek + 7) % 7;
  if (daysUntil === 0) daysUntil = 7;
  const target = new Date(referenceDate.getTime());
  target.setDate(target.getDate() + daysUntil);
  target.setHours(alarm.hour, alarm.minute, 0, 0);
  return target;
}

export function formatTimeUntilAlarm(targetDate: Date | null, referenceDate: Date = new Date()): string {
  if (!targetDate) return '';
  const diffMs = targetDate.getTime() - referenceDate.getTime();
  if (diffMs <= 0) return 'Alarm ringing now';

  const totalMinutes = Math.ceil(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0 && minutes <= 1) {
    return 'in less than a minute';
  }
  if (hours === 0) {
    return `in ${minutes} min`;
  }
  if (minutes === 0) {
    return `in ${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `in ${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
}

export function formatRepeatDays(repeatDays: DayOfWeek[]): string {
  if (!repeatDays || repeatDays.length === 0) {
    return 'Once';
  }
  if (repeatDays.length === 7) {
    return 'Every day';
  }
  const isWeekdays =
    repeatDays.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => repeatDays.includes(d as DayOfWeek));
  if (isWeekdays) {
    return 'Weekdays';
  }
  const isWeekends =
    repeatDays.length === 2 &&
    [0, 6].every((d) => repeatDays.includes(d as DayOfWeek));
  if (isWeekends) {
    return 'Weekends';
  }

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return repeatDays
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(', ');
}
