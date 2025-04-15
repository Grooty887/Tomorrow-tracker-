/**
 * Format a date as a human-readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time with duration as a range (e.g., "10:00 AM - 11:00 AM")
 */
export function formatTimeRange(time: string, durationMinutes: number): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  
  const startFormatted = formatTime(startDate);
  const endFormatted = formatTime(endDate);
  
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Format a time in 12-hour format
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get a relative time string (e.g., "In 2 hours" or "In 10 min")
 */
export function getRelativeTimeString(date: string, time: string): string {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  const scheduleDate = new Date(date);
  scheduleDate.setHours(hours, minutes, 0);
  
  const diffMs = scheduleDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  
  if (diffMinutes < 0) {
    return 'Past';
  } else if (diffMinutes === 0) {
    return 'Now';
  } else if (diffMinutes < 60) {
    return `In ${diffMinutes} min`;
  } else {
    const diffHours = Math.floor(diffMinutes / 60);
    return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}
