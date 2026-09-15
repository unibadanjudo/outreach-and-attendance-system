const LAGOS_TIMEZONE = 'Africa/Lagos';

/**
 * Formats a Date object or ISO string into YYYY-MM-DD in the Africa/Lagos timezone.
 */
export function formatToLagosDate(input: Date | string = new Date()): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date provided: "${String(input)}"`);
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: LAGOS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date); // en-CA outputs YYYY-MM-DD
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Africa/Lagos timezone.
 */
export function getLagosCurrentDate(): string {
  return formatToLagosDate(new Date());
}

/**
 * Returns current timestamp in Africa/Lagos formatted as readable string.
 */
export function getLagosCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validates whether a string matches the strict YYYY-MM-DD format.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Checks if a given date string (YYYY-MM-DD) falls within [startDate, endDate].
 */
export function isDateInRange(
  date: string,
  startDate?: string,
  endDate?: string,
): boolean {
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}
