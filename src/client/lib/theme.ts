import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark' | 'system';
const KEY = 'kiddin-theme';
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => 'system' as Theme,
  );
  const setTheme = useCallback((next: Theme) => {
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* private mode: fall through to in-memory */
    }
    applyTheme(next);
    listeners.forEach((l) => l());
  }, []);
  return { theme, setTheme };
}
