import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/** Parses `--token: light-dark(#light, #dark)` (or a single hex) from tokens.css. */
function readTokens() {
  const css = fs.readFileSync(
    path.resolve(import.meta.dirname, '../src/client/styles/tokens.css'),
    'utf8',
  );
  const out: Record<string, { light: string; dark: string }> = {};
  const re =
    /--([\w-]+):\s*(?:light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)|(#[0-9a-f]{6}))\s*;/gi;
  for (const m of css.matchAll(re)) {
    const light = (m[2] ?? m[4])!;
    const dark = (m[3] ?? m[4])!;
    out[m[1]!] = { light, dark };
  }
  return out;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].toSorted((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = readTokens();

// [foreground, background, minimum ratio]
const TEXT = 4.5;
const UI = 3; // SC 1.4.11 non-text contrast (borders, focus rings, icons)
const pairs: Array<[string, string, number]> = [
  ['ink', 'bg', TEXT],
  ['ink', 'bg-2', TEXT],
  ['ink', 'surface', TEXT],
  ['ink', 'surface-2', TEXT],
  ['ink', 'pink-soft', TEXT],
  ['ink', 'sun-soft', TEXT],
  ['ink', 'sky-soft', TEXT],
  ['muted', 'bg', TEXT],
  ['muted', 'bg-2', TEXT],
  ['muted', 'surface', TEXT],
  ['muted', 'surface-2', TEXT],
  ['muted', 'sun-soft', TEXT],
  ['muted', 'sky-soft', TEXT],
  ['link', 'bg', TEXT],
  ['link', 'surface', TEXT],
  ['pink', 'bg', TEXT],
  ['pink', 'surface', TEXT],
  ['on-pink', 'pink', TEXT],
  ['on-sun', 'sun', TEXT],
  ['on-sky', 'sky', TEXT],
  ['on-danger', 'danger', TEXT],
  ['danger', 'surface', TEXT],
  ['danger', 'bg', TEXT],
  ['bg', 'ink', TEXT],
  ['line-strong', 'surface', UI],
  ['line-strong', 'bg', UI],
  ['focus', 'bg', UI],
  ['focus', 'surface', UI],
  ['focus', 'sky-soft', UI],
  ['focus', 'sun-soft', UI],
];

describe('design tokens meet WCAG 2.2 AA contrast', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const [fg, bg, min] of pairs) {
      it(`${scheme}: --${fg} on --${bg} ≥ ${min}:1`, () => {
        const a = tokens[fg]?.[scheme];
        const b = tokens[bg]?.[scheme];
        expect(a, `missing token --${fg}`).toBeDefined();
        expect(b, `missing token --${bg}`).toBeDefined();
        expect(contrast(a!, b!)).toBeGreaterThanOrEqual(min);
      });
    }
  }
});
