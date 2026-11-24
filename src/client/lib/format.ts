const price = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const longDate = new Intl.DateTimeFormat('en-AU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const relative = new Intl.RelativeTimeFormat('en-AU', { numeric: 'auto' });

export const formatPrice = (value: number) => price.format(value);
export const formatLongDate = (iso: string) => longDate.format(new Date(iso));

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

export function formatRelative(iso: string, now = Date.now()): string {
  const seconds = (new Date(iso).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

/** "Marketplace: Buy and Sell Baby Stuff" → { kicker: "Marketplace", title: "Buy and Sell Baby Stuff" } */
export function splitThreadTitle(title: string): { kicker: string | null; title: string } {
  const i = title.indexOf(':');
  if (i === -1) return { kicker: null, title };
  return { kicker: title.slice(0, i).trim(), title: title.slice(i + 1).trim() };
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
