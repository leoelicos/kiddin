import { Link } from 'react-router';
import type { ThreadSummary } from '../../shared/types.ts';
import { plural, splitThreadTitle } from '../lib/format.ts';
import './ThreadCard.css';

const TONES = ['sun', 'pink', 'sky'] as const;
const EMOJI: Record<string, string> = { Marketplace: '🛒', Confessions: '🙊' };

export function ThreadCard({
  thread,
  index,
  loggedIn,
}: {
  thread: ThreadSummary;
  index: number;
  loggedIn: boolean;
}) {
  const { kicker, title } = splitThreadTitle(thread.title);
  const tone = TONES[index % TONES.length];
  const emoji = (kicker && EMOJI[kicker]) ?? '😤';
  const titleId = `thread-${thread.id}-title`;

  return (
    <article className="thread-card" data-tone={tone} data-spot aria-labelledby={titleId}>
      <div className="thread-card__media">
        <img
          src={thread.img}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          style={{ viewTransitionName: `thread-img-${thread.id}` }}
        />
        <span className="thread-card__emoji" aria-hidden="true">
          {emoji}
        </span>
      </div>
      <div className="thread-card__body">
        <p className="thread-card__kicker">{kicker ?? 'Guess my kid'}</p>
        <h3 id={titleId} className="thread-card__title">
          {/* Whole card is clickable via the stretched link, without nesting interactive content. */}
          <Link to={`/thread/${thread.id}`} className="thread-card__link" viewTransition>
            {title}
          </Link>
        </h3>
        <p className="thread-card__meta">
          <span className="chip">{plural(thread.postCount, 'post')}</span>
          {thread.isMarketplace && <span className="chip chip--sun">Buy &amp; sell</span>}
          {!loggedIn && <span className="thread-card__lock">Log in to join</span>}
        </p>
      </div>
      <span className="thread-card__arrow" aria-hidden="true">
        →
      </span>
    </article>
  );
}
