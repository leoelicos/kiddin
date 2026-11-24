import { Router } from 'express';
import { notFoundApi } from '../lib/http.ts';
import { postsRouter } from './posts.ts';
import { threadsRouter } from './threads.ts';
import { usersRouter } from './users.ts';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true });
});
apiRouter.use('/users', usersRouter);
apiRouter.use('/threads', threadsRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use(notFoundApi);
