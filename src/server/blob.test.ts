import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const BLOB_BASE = 'https://abc123.public.blob.vercel-storage.com';

const blob = vi.hoisted(() => ({
  put: vi.fn<(pathname: string, body: unknown, options: object) => Promise<object>>(),
  del: vi.fn<(url: string, options: object) => Promise<void>>(),
}));
vi.mock('@vercel/blob', () => blob);

const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kiddin-blob-'));
process.env.UPLOAD_DIR = uploadDir;
process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test_token';

const { createApp } = await import('./app.ts');
const { sequelize } = await import('./db.ts');
const { seed } = await import('./seeds/seed.ts');
const { Post } = await import('./models/index.ts');
const { deleteImage, isBlobUrl } = await import('./lib/uploads.ts');

const { app, store } = createApp();

const png = await sharp({
  create: { width: 64, height: 48, channels: 3, background: '#33aa66' },
})
  .png()
  .toBuffer();

async function loggedInAgent(email = 'leo@leo.com', password = 'leoiscool') {
  const agent = request.agent(app);
  await agent.post('/api/users/login').send({ email, password }).expect(200);
  return agent;
}

function createPost(agent: ReturnType<typeof request.agent>) {
  return agent
    .post('/api/posts/uploads')
    .set('Accept', 'application/json')
    .field('title', 'Cloud nap')
    .field('text', 'Stored in Blob.')
    .field('alt', 'Toddler asleep on a beanbag')
    .field('threadId', '2')
    .attach('upload', png, { filename: 'nap.png', contentType: 'image/png' });
}

beforeAll(async () => {
  await store.sync();
});

beforeEach(async () => {
  await seed();
  blob.put.mockReset();
  blob.del.mockReset();
  blob.put.mockImplementation(async (pathname: string) => ({
    url: `${BLOB_BASE}/${pathname.replace(/\.webp$/, '-Xy12.webp')}`,
    pathname,
  }));
  blob.del.mockResolvedValue(undefined);
});

afterAll(async () => {
  await sequelize.close();
  await fs.rm(uploadDir, { recursive: true, force: true });
});

describe('Vercel Blob uploads (BLOB_READ_WRITE_TOKEN set)', () => {
  it('uploads the processed WebP to Blob and stores the returned URL', async () => {
    const agent = await loggedInAgent();
    const res = await createPost(agent).expect(201);

    expect(blob.put).toHaveBeenCalledTimes(1);
    const [pathname, body, options] = blob.put.mock.calls[0]!;
    expect(pathname).toMatch(/^uploads\/\d+-[0-9a-f]{8}\.webp$/);
    expect(options).toMatchObject({
      access: 'public',
      contentType: 'image/webp',
      token: 'vercel_blob_rw_test_token',
    });
    const meta = await sharp(body as Buffer).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.exif).toBeUndefined();

    expect(res.body.image_url).toMatch(
      /^https:\/\/abc123\.public\.blob\.vercel-storage\.com\/uploads\/.+\.webp$/,
    );
    const saved = await Post.findByPk(res.body.id);
    expect(saved?.image_url).toBe(res.body.image_url);
    expect(await fs.readdir(uploadDir)).toHaveLength(0);
  });

  it('deletes the blob when its post is deleted', async () => {
    const agent = await loggedInAgent();
    const created = await createPost(agent).expect(201);
    await agent
      .delete(`/api/posts/${created.body.id}`)
      .set('Accept', 'application/json')
      .expect(200);
    expect(blob.del).toHaveBeenCalledWith(created.body.image_url, {
      token: 'vercel_blob_rw_test_token',
    });
    expect(await Post.findByPk(created.body.id)).toBeNull();
  });

  it('leaves seeded /images assets alone and still deletes the post', async () => {
    const jess = await loggedInAgent('jess@jess.com', 'jessiscool');
    await jess.delete('/api/posts/1').set('Accept', 'application/json').expect(200);
    expect(blob.del).not.toHaveBeenCalled();
    await request(app).get('/images/seeds/babynappies.webp').expect(200);
  });

  it('still deletes the post if Blob deletion fails', async () => {
    const agent = await loggedInAgent();
    const created = await createPost(agent).expect(201);
    blob.del.mockRejectedValueOnce(new Error('network down'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await agent
      .delete(`/api/posts/${created.body.id}`)
      .set('Accept', 'application/json')
      .expect(200);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    expect(await Post.findByPk(created.body.id)).toBeNull();
  });

  it('does not create a post when the Blob upload fails', async () => {
    const agent = await loggedInAgent();
    blob.put.mockRejectedValueOnce(new Error('quota'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const before = await Post.count();
    const res = await createPost(agent);
    error.mockRestore();
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(await Post.count()).toBe(before);
  });

  it('allows Blob images in the CSP img-src', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.headers['content-security-policy']).toMatch(
      /img-src [^;]*https:\/\/\*\.public\.blob\.vercel-storage\.com/,
    );
  });

  it('recognises only https Blob hosts as Blob URLs', async () => {
    expect(isBlobUrl(`${BLOB_BASE}/uploads/a.webp`)).toBe(true);
    expect(isBlobUrl('/data/uploads/a.webp')).toBe(false);
    expect(isBlobUrl('https://evil.example/public.blob.vercel-storage.com/a.webp')).toBe(false);
    expect(isBlobUrl('http://abc.public.blob.vercel-storage.com/a.webp')).toBe(false);
    await deleteImage('https://evil.example/x.webp');
    expect(blob.del).not.toHaveBeenCalled();
  });
});
