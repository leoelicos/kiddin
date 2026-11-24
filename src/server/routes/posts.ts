import { Router } from 'express';
import { z } from 'zod';
import { LIMITS } from '../../shared/types.ts';
import { withAuth } from '../lib/auth.ts';
import { HttpError, parse, wantsJson } from '../lib/http.ts';
import { isMarketplace, toPostDto } from '../lib/serialize.ts';
import { saveImage, upload } from '../lib/uploads.ts';
import { Post, Thread, User } from '../models/index.ts';

export const postsRouter = Router();

const PostBody = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Give your post a title.' })
    .max(LIMITS.titleMax, { error: `Titles are ${LIMITS.titleMax} characters max.` }),
  text: z
    .string()
    .trim()
    .min(1, { error: 'Add a short description.' })
    .max(LIMITS.textMax, { error: `Descriptions are ${LIMITS.textMax} characters max.` }),
  alt: z
    .string()
    .trim()
    .max(LIMITS.altMax, { error: `Alt text is ${LIMITS.altMax} characters max.` })
    .optional()
    .transform((v) => v || null),
  // v1 field name
  threadId: z.coerce.number().int().positive(),
  price: z
    .union([
      z.literal(''),
      z.coerce.number().min(0, { error: 'Price can’t be negative.' }).max(1_000_000),
    ])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : Math.round(v * 100) / 100)),
});

const IdParams = z.object({ id: z.coerce.number().int().positive() });

/**
 * POST /api/posts/uploads — multipart form (fields: title, text, price, threadId, file: upload).
 * v1-compatible: classic form posts are redirected (303) to the thread;
 * fetch clients sending `Accept: application/json` get 201 + the created post.
 */
postsRouter.post('/uploads', withAuth, upload.single('upload'), async (req, res) => {
  const body = parse(PostBody, req.body);
  if (!req.file) {
    throw new HttpError(400, 'Please add a photo.', [
      { path: 'upload', message: 'Please add a photo.' },
    ]);
  }
  const thread = await Thread.findByPk(body.threadId);
  if (!thread) throw new HttpError(404, 'That thread does not exist.');
  if (isMarketplace(thread.id) && body.price === null) {
    throw new HttpError(400, 'Marketplace listings need a price.', [
      { path: 'price', message: 'Marketplace listings need a price.' },
    ]);
  }

  const image_url = await saveImage(req.file.buffer);
  const post = await Post.create({
    title: body.title,
    text: body.text,
    price: isMarketplace(thread.id) ? body.price : null,
    image_url,
    image_alt: body.alt,
    thread_id: thread.id,
    user_id: req.session.user_id!,
  });

  if (!wantsJson(req)) {
    res.redirect(303, `/thread/${thread.id}`);
    return;
  }
  const created = await Post.findByPk(post.id, {
    include: [
      { model: User, attributes: ['username'] },
      { model: Thread, attributes: ['title'] },
    ],
  });
  res.status(201).json(toPostDto(created!));
});

/** DELETE /api/posts/:id — only the author can delete (v1-compatible). */
postsRouter.delete('/:id', withAuth, async (req, res) => {
  const { id } = parse(IdParams, req.params);
  const deleted = await Post.destroy({ where: { id, user_id: req.session.user_id! } });
  if (!deleted) throw new HttpError(404, 'No post found with this id!');
  res.status(200).json(deleted);
});
