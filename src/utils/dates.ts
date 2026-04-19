export function parseDDMMYYYY(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') return new Date(NaN);
  const parts = dateString.split('/');
  if (parts.length !== 3) return new Date(NaN);
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return new Date(NaN);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getRelativeDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(hoursBefore: number): string {
  // Convert "hours before midnight" to a clock time on the previous evening.
  // e.g. 18 hours before midnight = 6:00 AM (18h before midnight is 6am same day)
  // Actually we treat hoursBefore as: notify X hours before collection day midnight
  // So 18h before = 6pm the night before
  const totalMinutes = 24 * 60 - hoursBefore * 60;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}
