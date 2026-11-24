import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { SessionInfo, ThreadSummary } from '../../shared/types.ts';
import { Hero } from '../components/Hero.tsx';
import { ThreadCard } from '../components/ThreadCard.tsx';
import { api } from '../lib/api.ts';
import './home.css';

export async function homeLoader({ request }: { request: Request }) {
  return api.threads(request.signal);
}

export function HomeRoute() {
  const threads = useLoaderData() as ThreadSummary[];
  const session = useRouteLoaderData('root') as SessionInfo | undefined;
  const loggedIn = Boolean(session?.loggedIn);
  const totalPosts = threads.reduce((n, t) => n + t.postCount, 0);

  return (
    <>
      <title>Kiddin’ · The parenting chaos club</title>
      <Hero totalPosts={totalPosts} threadCount={threads.length} loggedIn={loggedIn} />

      <section id="threads" className="section wrap" aria-labelledby="threads-title">
        <div className="section__head">
          <p className="eyebrow">Pick a thread</p>
          <h2 id="threads-title" className="section__title">
            Where do you want to start?
          </h2>
        </div>
        <ul className="thread-grid" role="list">
          {threads.map((t, i) => (
            <li key={t.id}>
              <ThreadCard thread={t} index={i} loggedIn={loggedIn} />
            </li>
          ))}
        </ul>
      </section>

      <section className="section wrap how" aria-labelledby="how-title">
        <div className="section__head">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="section__title">
            Three steps. Zero judgement.
          </h2>
        </div>
        <ol className="how__steps">
          <li data-tone="pink">
            <span className="how__n" aria-hidden="true">
              1
            </span>
            <h3>Join the club</h3>
            <p>
              Sign up with a username, email and password. Takes about as long as a nappy change.
            </p>
          </li>
          <li data-tone="sun">
            <span className="how__n" aria-hidden="true">
              2
            </span>
            <h3>Pick a thread</h3>
            <p>
              Sell outgrown gear, confess your 3am sins, or make everyone guess why your kid is mad.
            </p>
          </li>
          <li data-tone="sky">
            <span className="how__n" aria-hidden="true">
              3
            </span>
            <h3>Post a photo</h3>
            <p>Add a title, a few words and a picture. We strip location data from every photo.</p>
          </li>
        </ol>
        {!loggedIn && (
          <p className="how__cta">
            <Link to="/login" className="btn btn--primary btn--lg" viewTransition>
              Join Kiddin’ — it’s free
            </Link>
          </p>
        )}
      </section>
    </>
  );
}
