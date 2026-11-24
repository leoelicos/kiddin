import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { routes } from '../router.tsx';

type Handler = (init: RequestInit | undefined) => { status?: number; body?: unknown };

/** A canned non-200 reply, e.g. `reply(401, { message })`. */
export const reply =
  (status: number, body?: unknown): Handler =>
  () => ({ status, body });

/** Mounts the real route tree in memory with a fake API keyed by "METHOD /path". */
export function renderApp(path: string, api: Record<string, Handler | unknown>) {
  const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
    const url = new URL(String(input), 'http://localhost');
    const key = `${(init?.method ?? 'GET').toUpperCase()} ${url.pathname}`;
    if (!(key in api))
      return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
    const entry = api[key];
    const { status = 200, body } =
      typeof entry === 'function' ? (entry as Handler)(init) : { status: 200, body: entry };
    return new Response(status === 204 ? null : JSON.stringify(body ?? {}), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(<RouterProvider router={router} />);
  return { ...utils, router, fetchMock };
}
