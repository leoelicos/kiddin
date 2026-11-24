import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router';
import { Footer } from '../components/Footer.tsx';
import { Header } from '../components/Header.tsx';
import { ToastProvider } from '../components/Toaster.tsx';
import { api } from '../lib/api.ts';
import type { SessionInfo } from '../../shared/types.ts';

export async function rootLoader({ request }: { request: Request }): Promise<SessionInfo> {
  try {
    return await api.me(request.signal);
  } catch {
    return { loggedIn: false, user: null };
  }
}

/**
 * SPA route-change accessibility: after client-side navigation, move focus to
 * <main> and announce the new page title, mirroring a full page load.
 */
function useRouteAnnouncer() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const id = requestAnimationFrame(() => {
      document.getElementById('main')?.focus({ preventScroll: true });
      setMessage(document.title);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return message;
}

export function RootLayout() {
  const navigation = useNavigation();
  const announcement = useRouteAnnouncer();
  return (
    <ToastProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div
        className="progress"
        data-active={navigation.state === 'loading' ? '' : undefined}
        aria-hidden="true"
      />
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <ScrollRestoration />
    </ToastProvider>
  );
}

/** Shown while the first route's data loads. */
export function BootScreen() {
  return (
    <output className="boot">
      <span className="spinner" aria-hidden="true" />
      <span>Warming up the bottles…</span>
    </output>
  );
}
