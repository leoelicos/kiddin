import { Router } from 'express';
import { z } from 'zod';
import type { ThreadDetail, ThreadSummary } from '../../shared/types.ts';
import { withAuth } from '../lib/auth.ts';
import { HttpError, parse } from '../lib/http.ts';
import { isMarketplace, toPostDto, toThreadSummary } from '../lib/serialize.ts';
import { Post, Thread, User } from '../models/index.ts';

export const threadsRouter = Router();

const IdParams = z.object({ id: z.coerce.number().int().positive() });

async function postCounts(): Promise<Map<number, number>> {
  const rows = (await Post.count({ group: ['thread_id'] })) as unknown as Array<{
    thread_id: number;
    count: number;
  }>;
  return new Map(rows.map((r) => [Number(r.thread_id), Number(r.count)]));
}

/** GET /api/threads — public list for the homepage (new in v2). */
threadsRouter.get('/', async (_req, res) => {
  const [threads, counts] = await Promise.all([
    Thread.findAll({ order: [['id', 'ASC']] }),
    postCounts(),
  ]);
  const body: ThreadSummary[] = threads.map((t) => toThreadSummary(t, counts.get(t.id) ?? 0));
  res.json(body);
});

/** GET /api/threads/:id — a thread and its posts, newest first. Signed-in only, like v1. */
threadsRouter.get('/:id', withAuth, async (req, res) => {
  const { id } = parse(IdParams, req.params);
  const thread = await Thread.findByPk(id);
  if (!thread) throw new HttpError(404, 'That thread does not exist.');

  const posts = await Post.findAll({
    where: { thread_id: id },
    include: [
      { model: User, attributes: ['username'] },
      { model: Thread, attributes: ['title'] },
    ],
    order: [['id', 'DESC']],
  });

  const body: ThreadDetail = {
    thread: toThreadSummary(thread, posts.length),
    posts: posts.map(toPostDto),
    isMarketplace: isMarketplace(id),
  };
  res.json(body);
});
