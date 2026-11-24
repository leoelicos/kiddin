import { MARKETPLACE_THREAD_ID, type PostDto, type ThreadSummary } from '../../shared/types.ts';
import type { Post, Thread } from '../models/index.ts';

export const isMarketplace = (threadId: number) => threadId === MARKETPLACE_THREAD_ID;

export function toThreadSummary(thread: Thread, postCount: number): ThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    img: thread.img,
    isMarketplace: isMarketplace(thread.id),
    postCount,
  };
}

export function toPostDto(post: Post): PostDto {
  return {
    id: post.id,
    title: post.title,
    text: post.text,
    image_url: post.image_url,
    image_alt: post.image_alt ?? null,
    price: post.price,
    date: new Date(post.date).toISOString(),
    thread_id: post.thread_id,
    user_id: post.user_id,
    user: post.user ? { username: post.user.username } : null,
    thread: post.thread ? { title: post.thread.title } : null,
  };
}
