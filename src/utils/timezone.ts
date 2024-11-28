import { zonedTimeToUtc, formatInTimeZone } from 'date-fns-tz';

export function formatTimeWithZone(date: Date, timezone: string): string {
  try {
    // Validate timezone format
    const validTimezone = timezone.match(/^UTC[+-]\d{2}:00$/)
      ? timezone
      : 'UTC';

    // Convert to UTC first to ensure valid time
    const utcDate = zonedTimeToUtc(date, validTimezone);
    
    return formatInTimeZone(utcDate, validTimezone, 'HH:mm:ss');
  } catch (error) {
    console.warn('Invalid timezone format:', timezone);
    return formatInTimeZone(date, 'UTC', 'HH:mm:ss');
  }
}