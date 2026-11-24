import { describe, expect, it } from 'vitest';
import { formatPrice, formatRelative, plural, splitThreadTitle } from './format.ts';

describe('format', () => {
  it('formats AUD prices', () => {
    expect(formatPrice(35)).toBe('$35.00');
  });
  it('formats relative dates', () => {
    const now = Date.parse('2026-01-10T00:00:00Z');
    expect(formatRelative('2026-01-09T00:00:00Z', now)).toBe('yesterday');
    expect(formatRelative('2026-01-10T00:00:00Z', now)).toBe('just now');
    expect(formatRelative('2025-01-01T00:00:00Z', now)).toBe('last year');
  });
  it('splits thread titles into kicker + title', () => {
    expect(splitThreadTitle('Marketplace: Buy stuff')).toEqual({
      kicker: 'Marketplace',
      title: 'Buy stuff',
    });
    expect(splitThreadTitle('Guess what')).toEqual({ kicker: null, title: 'Guess what' });
  });
  it('pluralises', () => {
    expect(plural(1, 'post')).toBe('1 post');
    expect(plural(3, 'post')).toBe('3 posts');
  });
});
