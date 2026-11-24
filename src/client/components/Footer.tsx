import { Link } from 'react-router';
import { Wordmark } from './Wordmark.tsx';
import './Footer.css';

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div>
          <Link to="/" className="site-footer__brand">
            <Wordmark />
            <span className="sr-only">Kiddin’ home</span>
          </Link>
          <p className="site-footer__tag">
            Raising tiny humans is chaos. You don’t have to do it alone.
          </p>
        </div>
        <ul className="site-footer__links">
          <li>
            <a href="https://github.com/leoelicos/kiddin">Source on GitHub</a>
          </li>
          <li>
            <a href="https://github.com/leoelicos/kiddin/blob/main/LICENSE">MIT licence</a>
          </li>
        </ul>
        <p className="site-footer__credit">
          Made with love (and very little sleep) by Ali, Jess &amp; Leo · © 2022–
          {YEAR}
        </p>
      </div>
    </footer>
  );
}
