import type { PostDto } from '../../shared/types.ts';
import { formatLongDate, formatPrice, formatRelative } from '../lib/format.ts';
import './PostCard.css';

export function PostCard({
  post,
  isMarketplace,
  featured = false,
  canDelete = false,
  onDelete,
  headingLevel = 3,
}: {
  post: PostDto;
  isMarketplace: boolean;
  featured?: boolean;
  canDelete?: boolean;
  onDelete?: (post: PostDto) => void;
  headingLevel?: 2 | 3;
}) {
  const H = `h${headingLevel}` as const;
  const titleId = `post-${post.id}-title`;
  return (
    <article
      className="post-card"
      data-featured={featured ? '' : undefined}
      aria-labelledby={titleId}
    >
      <div className="post-card__inner">
        {post.image_url && (
          <div className="post-card__media">
            <img
              src={post.image_url}
              alt={post.image_alt ?? `Photo for “${post.title}”`}
              loading={featured ? 'eager' : 'lazy'}
              decoding="async"
            />
            {isMarketplace && post.price !== null && (
              <p className="post-card__price">
                <span className="sr-only">Price:</span> {formatPrice(post.price)}
              </p>
            )}
          </div>
        )}
        <div className="post-card__body">
          {featured && <p className="post-card__flag">Latest post</p>}
          <H id={titleId} className="post-card__title">
            {post.title}
          </H>
          <p className="post-card__text">{post.text}</p>
          <footer className="post-card__meta">
            <span className="avatar" aria-hidden="true">
              {post.user?.username.slice(0, 1).toUpperCase() ?? '?'}
            </span>
            <span>
              <span className="sr-only">Posted by</span>{' '}
              <strong>{post.user?.username ?? 'Someone'}</strong>
              {' · '}
              <time dateTime={post.date} title={formatLongDate(post.date)}>
                {formatRelative(post.date)}
              </time>
            </span>
            {canDelete && onDelete && (
              <button type="button" className="post-card__delete" onClick={() => onDelete(post)}>
                Delete <span className="sr-only">“{post.title}”</span>
              </button>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
}
