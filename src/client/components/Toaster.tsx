import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import './Toaster.css';

type Tone = 'success' | 'info' | 'error';
interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

/** `const toast = useToast(); toast('Posted!')` */
export const useToast = () => use(ToastContext);

/**
 * Accessible toasts: messages are announced through a polite live region
 * (errors assertively), stay until dismissed or for 6s, and pause while hovered
 * or focused so nobody is rushed (WCAG 2.2.1).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const schedule = useCallback(
    (id: number) => {
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 6000),
      );
    },
    [dismiss],
  );

  const push = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, message, tone }]);
      schedule(id);
    },
    [schedule],
  );

  const pause = (id: number) => clearTimeout(timers.current.get(id));

  const value = useMemo(() => push, [push]);
  const polite = toasts.filter((t) => t.tone !== 'error');
  const urgent = toasts.filter((t) => t.tone === 'error');

  const render = (list: Toast[]) =>
    list.map((t) => (
      <div
        key={t.id}
        className="toast"
        data-tone={t.tone}
        onMouseEnter={() => pause(t.id)}
        onMouseLeave={() => schedule(t.id)}
        onFocus={() => pause(t.id)}
        onBlur={() => schedule(t.id)}
      >
        <span className="toast__icon" aria-hidden="true">
          {t.tone === 'error' ? '!' : t.tone === 'info' ? 'i' : '✓'}
        </span>
        <span className="toast__msg">{t.message}</span>
        <button type="button" className="toast__close" onClick={() => dismiss(t.id)}>
          <span className="sr-only">Dismiss notification</span>
          <span aria-hidden="true">×</span>
        </button>
      </div>
    ));

  return (
    <ToastContext value={value}>
      {children}
      <div className="toaster">
        <output aria-live="polite" aria-label="Notifications" className="toaster__list">
          {render(polite)}
        </output>
        <div role="alert" aria-live="assertive" aria-label="Errors" className="toaster__list">
          {render(urgent)}
        </div>
      </div>
    </ToastContext>
  );
}
