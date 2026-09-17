export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const trimmed = dateString.trim();
  if (!trimmed) return '—';

  // Support Nigerian/UK DD/MM/YYYY format commonly used in Google Forms
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  try {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return trimmed;
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return trimmed;
  }
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
