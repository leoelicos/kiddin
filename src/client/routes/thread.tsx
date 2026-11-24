import { useEffect, useState } from 'react';
import {
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import type { PostDto, SessionInfo, ThreadDetail } from '../../shared/types.ts';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { PostCard } from '../components/PostCard.tsx';
import { PostComposer } from '../components/PostComposer.tsx';
import { useToast } from '../components/Toaster.tsx';
import { api, ApiError } from '../lib/api.ts';
import { toActionError } from '../lib/errors.ts';
import { plural, splitThreadTitle } from '../lib/format.ts';
import type { ThreadActionData } from '../lib/types.ts';
import './thread.css';

export async function threadLoader({ params, request }: LoaderFunctionArgs) {
  try {
    return await api.thread(params.id ?? '', request.signal);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const next = new URL(request.url).pathname;
      throw redirect(`/login?next=${encodeURIComponent(next)}`);
    }
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      throw new Response('Thread not found', { status: 404 });
    }
    throw err;
  }
}

export async function threadAction({ request }: ActionFunctionArgs): Promise<ThreadActionData> {
  const form = await request.formData();
  const intent = form.get('intent');
  if (intent === 'delete') {
    try {
      await api.deletePost(String(form.get('postId')));
      return { ok: true, intent: 'delete' };
    } catch (err) {
      return toActionError('delete', err);
    }
  }
  form.delete('intent');
  try {
    const post = await api.createPost(form);
    return { ok: true, intent: 'create', id: post.id };
  } catch (err) {
    return toActionError('create', err);
  }
}

export function ThreadRoute() {
  const { thread, posts, isMarketplace } = useLoaderData() as ThreadDetail;
  const session = useRouteLoaderData('root') as SessionInfo | undefined;
  const userId = session?.user?.id;
  const { kicker, title } = splitThreadTitle(thread.title);
  const [latest, ...rest] = posts;

  const del = useFetcher<ThreadActionData>();
  const toast = useToast();
  const [pending, setPending] = useState<PostDto | null>(null);

  useEffect(() => {
    if (del.state !== 'idle' || !del.data) return;
    if (del.data.ok) toast('Post deleted.', 'info');
    else toast(del.data.message, 'error');
  }, [del.state, del.data, toast]);

  const card = (p: PostDto, featured = false) => (
    <PostCard
      post={p}
      isMarketplace={isMarketplace}
      featured={featured}
      canDelete={p.user_id === userId}
      onDelete={setPending}
    />
  );

  return (
    <>
      <title>{`${title} · Kiddin’`}</title>
      <section className="thread-hero" data-market={isMarketplace ? '' : undefined}>
        <div className="wrap thread-hero__inner">
          <nav aria-label="Breadcrumb" className="crumbs">
            <ol>
              <li>
                <Link to="/" viewTransition>
                  Threads
                </Link>
              </li>
              <li aria-current="page">{kicker ?? title}</li>
            </ol>
          </nav>
          <div className="thread-hero__head">
            <img
              className="thread-hero__img"
              src={thread.img}
              alt=""
              style={{ viewTransitionName: `thread-img-${thread.id}` }}
            />
            <div>
              {kicker && <p className="eyebrow">{kicker}</p>}
              <h1 className="thread-hero__title">{title}</h1>
              <p className="thread-hero__count">{plural(posts.length, 'post')} so far</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap thread-layout">
        <aside className="thread-layout__side" aria-label="New post">
          <PostComposer threadId={thread.id} isMarketplace={isMarketplace} />
        </aside>

        <section className="thread-layout__feed" aria-labelledby="feed-title">
          <h2 id="feed-title" className="sr-only">
            All posts
          </h2>
          {latest ? (
            <>
              {card(latest, true)}
              {rest.length > 0 && (
                <ul className="feed" role="list">
                  {rest.map((p) => (
                    <li key={p.id}>{card(p)}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="empty card">
              <p className="empty__emoji" aria-hidden="true">
                🍼
              </p>
              <p>
                <strong>It’s quiet in here.</strong> Be the first to post!
              </p>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Delete this post?"
        confirmLabel="Delete post"
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          setPending(null);
          void del.submit({ intent: 'delete', postId: String(pending.id) }, { method: 'post' });
        }}
      >
        <p>“{pending?.title}” will be removed for everyone. This can’t be undone.</p>
      </ConfirmDialog>
    </>
  );
}
