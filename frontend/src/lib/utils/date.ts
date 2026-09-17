export function getOrdinalDay(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st of`;
    case 2:
      return `${day}nd of`;
    case 3:
      return `${day}rd of`;
    default:
      return `${day}th of`;
  }
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const trimmed = dateString.trim();
  if (!trimmed) return '—';

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Support DD/MM (day and month only, e.g. for privacy masking)
  const dmMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})$/);
  if (dmMatch) {
    const [, day, month] = dmMatch;
    const mIdx = Number(month) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${getOrdinalDay(Number(day))} ${monthNames[mIdx]}`;
    }
    return trimmed;
  }

  // Support Nigerian/UK DD/MM/YYYY format commonly used in Google Forms
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const mIdx = Number(month) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${getOrdinalDay(Number(day))} ${monthNames[mIdx]} ${year}`;
    }
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) {
      return `${getOrdinalDay(d.getDate())} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    }
  }

  try {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return trimmed;
    return `${getOrdinalDay(d.getDate())} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return trimmed;
  }
}

export function formatDateOfBirth(
  dobString?: string | null,
  isReacher: boolean = false,
): string {
  if (!dobString) return '—';
  const trimmed = dobString.trim();
  if (!trimmed) return '—';

  const monthNames = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Match DD/MM or DD-MM (already masked)
  const dmMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})$/);
  if (dmMatch) {
    const [, day, month] = dmMatch;
    const mIdx = Number(month) - 1;
    const mName = mIdx >= 0 && mIdx < 12 ? monthNames[mIdx] : month;
    return `${getOrdinalDay(Number(day))} ${mName}`;
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const mIdx = Number(month) - 1;
    const mName = mIdx >= 0 && mIdx < 12 ? monthNames[mIdx] : month;
    if (isReacher) {
      return `${getOrdinalDay(Number(day))} ${mName}`;
    }
    return `${getOrdinalDay(Number(day))} ${mName} ${year}`;
  }

  // Match YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    const mIdx = Number(month) - 1;
    const mName = mIdx >= 0 && mIdx < 12 ? monthNames[mIdx] : month;
    if (isReacher) {
      return `${getOrdinalDay(Number(day))} ${mName}`;
    }
    return `${getOrdinalDay(Number(day))} ${mName} ${year}`;
  }

  return formatDate(trimmed);
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getDaysAgo(dateString?: string | null): number | null {
  if (!dateString) return null;
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatDaysAgoString(dateString?: string | null): string {
  const days = getDaysAgo(dateString);
  if (days === null) return 'Never attended';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
