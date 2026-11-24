import { useTheme, type Theme } from '../lib/theme.ts';
import './ThemeToggle.css';

const ORDER: Theme[] = ['system', 'light', 'dark'];
const LABEL: Record<Theme, string> = { system: 'Auto', light: 'Light', dark: 'Dark' };
const ICON: Record<Theme, string> = { system: '◐', light: '☀', dark: '☾' };

/** Cycles Auto → Light → Dark. The visible label always states the current theme. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Colour theme: ${LABEL[theme]}. Switch to ${LABEL[next]}.`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {ICON[theme]}
      </span>
      <span className="theme-toggle__label" aria-hidden="true">
        {LABEL[theme]}
      </span>
    </button>
  );
}
