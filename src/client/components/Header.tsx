import { Link, NavLink, useFetcher, useRouteLoaderData } from 'react-router';
import type { SessionInfo } from '../../shared/types.ts';
import { MARKETPLACE_THREAD_ID } from '../../shared/types.ts';
import { ThemeToggle } from './ThemeToggle.tsx';
import { Wordmark } from './Wordmark.tsx';
import './Header.css';

export function Header() {
  const session = useRouteLoaderData('root') as SessionInfo | undefined;
  const logout = useFetcher();
  const loggingOut = logout.state !== 'idle';

  return (
    <header className="site-header">
      <div className="site-header__inner wrap">
        <Link to="/" className="site-header__brand" viewTransition>
          <img
            src="/images/happy-baby.webp"
            alt=""
            width="44"
            height="44"
            className="site-header__baby"
          />
          <Wordmark />
          <span className="sr-only">Kiddin’ home</span>
        </Link>

        <nav aria-label="Main" className="site-header__nav">
          <ul>
            <li>
              <NavLink to="/" end viewTransition>
                Threads
              </NavLink>
            </li>
            <li>
              <NavLink to={`/thread/${MARKETPLACE_THREAD_ID}`} viewTransition>
                Marketplace
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          {session?.loggedIn ? (
            <logout.Form method="post" action="/logout" className="site-header__user">
              <span className="site-header__hello">
                Hi, <strong>{session.user?.username}</strong>
              </span>
              <button type="submit" className="btn btn--ghost btn--sm" disabled={loggingOut}>
                {loggingOut ? 'Logging out…' : 'Log out'}
              </button>
            </logout.Form>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm" viewTransition>
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
