/** Currency used to display amounts across the app. */
export const APP_CURRENCY = 'USD';

/** Today's date as yyyy-MM-dd in the user's time zone. */
export function today(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Up to two initials of a person's name, e.g. "Maria Silva" → "MS". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
