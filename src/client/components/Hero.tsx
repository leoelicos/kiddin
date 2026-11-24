import { Link } from 'react-router';
import { MARKETPLACE_THREAD_ID } from '../../shared/types.ts';
import './Hero.css';

export function Hero({
  totalPosts,
  threadCount,
  loggedIn,
}: {
  totalPosts: number;
  threadCount: number;
  loggedIn: boolean;
}) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--chip">
            <span aria-hidden="true">👶</span> For bored, brilliant &amp; exhausted parents
          </p>
          <h1 id="hero-title" className="hero__title">
            Parenting is <span className="hero__scribble">chaos</span>.
            <br /> Share&nbsp;the&nbsp;fun bits.
          </h1>
          <p className="hero__lede">
            Swap baby gear in the Marketplace, confess what you did at 3am, and make everyone guess
            why your kid is mad. Taking care of your child has never been more fun.
          </p>
          <div className="hero__ctas">
            <a href="#threads" className="btn btn--primary btn--lg">
              Browse threads <span aria-hidden="true">↓</span>
            </a>
            {loggedIn ? (
              <Link
                to={`/thread/${MARKETPLACE_THREAD_ID}`}
                className="btn btn--ghost btn--lg"
                viewTransition
              >
                Visit the Marketplace
              </Link>
            ) : (
              <Link to="/login" className="btn btn--ghost btn--lg" viewTransition>
                Log in or sign up
              </Link>
            )}
          </div>
          <dl className="hero__stats">
            <div>
              <dt>Threads</dt>
              <dd>{threadCount}</dd>
            </div>
            <div>
              <dt>Posts shared</dt>
              <dd>{totalPosts}</dd>
            </div>
            <div>
              <dt>Judgement</dt>
              <dd>0</dd>
            </div>
          </dl>
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="hero__baby">
            <img src="/images/happy-baby.webp" alt="" width="512" height="512" />
          </div>
          <div
            className="sticker"
            data-tone="sun"
            style={{ '--rot': '-8deg', '--d': '0s' } as React.CSSProperties}
          >
            <span className="sticker__k">Marketplace</span>
            Nappies, 2 packs · $35
          </div>
          <div
            className="sticker"
            data-tone="pink"
            style={{ '--rot': '6deg', '--d': '.4s' } as React.CSSProperties}
          >
            <span className="sticker__k">Confession</span>I ate my baby’s candy 🍬
          </div>
          <div
            className="sticker"
            data-tone="sky"
            style={{ '--rot': '-3deg', '--d': '.8s' } as React.CSSProperties}
          >
            <span className="sticker__k">Guess my kid</span>Why is he mad?! 😤
          </div>
        </div>
      </div>
    </section>
  );
}
