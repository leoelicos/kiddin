import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kiddin-uploads-'));
process.env.UPLOAD_DIR = uploadDir;

const { createApp } = await import('./app.ts');
const { sequelize } = await import('./db.ts');
const { seed } = await import('./seeds/seed.ts');

const { app, store } = createApp();

const jpeg = await sharp({
  create: { width: 40, height: 30, channels: 3, background: '#ff66aa' },
})
  .jpeg()
  .toBuffer();

async function loggedInAgent(email = 'leo@leo.com', password = 'leoiscool') {
  const agent = request.agent(app);
  await agent.post('/api/users/login').send({ email, password }).expect(200);
  return agent;
}

beforeAll(async () => {
  await store.sync();
});

beforeEach(async () => {
  await seed();
});

afterAll(async () => {
  await sequelize.close();
  await fs.rm(uploadDir, { recursive: true, force: true });
});

describe('health + security headers', () => {
  it('responds and sets hardened headers', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns JSON 404 for unknown API routes', async () => {
    await request(app).get('/api/nope').expect(404, { message: 'Not found' });
  });
});

describe('threads', () => {
  it('lists threads publicly with post counts', async () => {
    const res = await request(app).get('/api/threads').expect(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({ id: 1, isMarketplace: true, postCount: 3 });
  });

  it('requires login to read a thread (401 JSON, 303 redirect for HTML)', async () => {
    await request(app).get('/api/threads/1').set('Accept', 'application/json').expect(401);
    const html = await request(app).get('/api/threads/1').set('Accept', 'text/html').expect(303);
    expect(html.headers.location).toBe('/login');
  });

  it('returns a thread with newest posts first', async () => {
    const agent = await loggedInAgent();
    const res = await agent.get('/api/threads/2').set('Accept', 'application/json').expect(200);
    expect(res.body.isMarketplace).toBe(false);
    const ids = res.body.posts.map((p: { id: number }) => p.id);
    expect(ids).toEqual(ids.toSorted((a: number, b: number) => b - a));
    expect(res.body.posts[0].user.username).toBeTypeOf('string');
    expect(res.body.posts[0]).not.toHaveProperty('password');
  });

  it('404s for a missing thread and 400s for a bad id', async () => {
    const agent = await loggedInAgent();
    await agent.get('/api/threads/999').set('Accept', 'application/json').expect(404);
    await agent.get('/api/threads/abc').set('Accept', 'application/json').expect(400);
  });
});

describe('users', () => {
  it('signs up without leaking the password hash, and starts a session', async () => {
    const agent = request.agent(app);
    const res = await agent
      .post('/api/users')
      .send({ username: 'Sam', email: 'Sam@Example.com', password: 'supersecret' })
      .expect(200);
    expect(res.body).toEqual({ id: expect.any(Number), username: 'Sam' });
    const me = await agent.get('/api/users/me').expect(200);
    expect(me.body).toEqual({ loggedIn: true, user: { id: res.body.id, username: 'Sam' } });
  });

  it('validates sign-up input with field-level issues', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: '', email: 'nope', password: 'short' })
      .expect(400);
    const paths = res.body.issues.map((i: { path: string }) => i.path).toSorted();
    expect(paths).toEqual(['email', 'password', 'username']);
  });

  it('rejects duplicate emails with 409', async () => {
    await request(app)
      .post('/api/users')
      .send({ username: 'Leo2', email: 'leo@leo.com', password: 'whatever123' })
      .expect(409);
  });

  it('uses one generic error for unknown email and wrong password', async () => {
    const a = await request(app)
      .post('/api/users/login')
      .send({ email: 'ghost@x.com', password: 'whatever' })
      .expect(401);
    const b = await request(app)
      .post('/api/users/login')
      .send({ email: 'leo@leo.com', password: 'wrongpass' })
      .expect(401);
    expect(a.body.message).toBe(b.body.message);
  });

  it('logs in case-insensitively and logs out', async () => {
    const agent = await loggedInAgent('LEO@LEO.COM');
    await agent.post('/api/users/logout').expect(204);
    await agent.post('/api/users/logout').expect(404);
    const me = await agent.get('/api/users/me');
    expect(me.body.loggedIn).toBe(false);
  });
});

describe('posts', () => {
  it('creates a post from multipart, re-encodes the image to WebP and strips metadata', async () => {
    const agent = await loggedInAgent();
    const res = await agent
      .post('/api/posts/uploads')
      .set('Accept', 'application/json')
      .field('title', 'Nap victory')
      .field('text', 'Two whole hours.')
      .field('alt', 'Sleeping toddler')
      .field('threadId', '2')
      .attach('upload', jpeg, { filename: 'nap.jpg', contentType: 'image/jpeg' })
      .expect(201);
    expect(res.body).toMatchObject({
      title: 'Nap victory',
      image_alt: 'Sleeping toddler',
      price: null,
      user: { username: 'Leo' },
    });
    expect(res.body.image_url).toMatch(/^\/data\/uploads\/.+\.webp$/);
    const file = path.join(uploadDir, path.basename(res.body.image_url));
    const meta = await sharp(file).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.exif).toBeUndefined();
    await request(app).get(res.body.image_url).expect(200);
  });

  it('keeps v1 behaviour for classic form posts (303 redirect to the thread)', async () => {
    const agent = await loggedInAgent();
    const res = await agent
      .post('/api/posts/uploads')
      .set('Accept', 'text/html')
      .field('title', 'Pram')
      .field('text', 'Barely used')
      .field('price', '120')
      .field('threadId', '1')
      .attach('upload', jpeg, { filename: 'pram.jpg', contentType: 'image/jpeg' })
      .expect(303);
    expect(res.headers.location).toBe('/thread/1');
  });

  it('requires a price in the Marketplace and a photo everywhere', async () => {
    const agent = await loggedInAgent();
    const noPrice = await agent
      .post('/api/posts/uploads')
      .set('Accept', 'application/json')
      .field('title', 'Cot')
      .field('text', 'Sturdy')
      .field('threadId', '1')
      .attach('upload', jpeg, { filename: 'cot.jpg', contentType: 'image/jpeg' })
      .expect(400);
    expect(noPrice.body.issues[0].path).toBe('price');

    await agent
      .post('/api/posts/uploads')
      .set('Accept', 'application/json')
      .field('title', 'No pic')
      .field('text', 'Oops')
      .field('threadId', '2')
      .expect(400);
  });

  it('rejects non-image uploads', async () => {
    const agent = await loggedInAgent();
    await agent
      .post('/api/posts/uploads')
      .set('Accept', 'application/json')
      .field('title', 'Malware')
      .field('text', 'Totally a photo')
      .field('threadId', '2')
      .attach('upload', Buffer.from('#!/bin/sh'), { filename: 'x.sh', contentType: 'text/x-sh' })
      .expect(400);
  });

  it('rejects posting when signed out', async () => {
    await request(app)
      .post('/api/posts/uploads')
      .set('Accept', 'application/json')
      .field('title', 'x')
      .expect(401);
  });

  it('only lets the author delete a post', async () => {
    const jess = await loggedInAgent('jess@jess.com', 'jessiscool');
    // Post 1 belongs to Jess, post 2 to Ali.
    await jess.delete('/api/posts/2').set('Accept', 'application/json').expect(404);
    await jess.delete('/api/posts/1').set('Accept', 'application/json').expect(200);
  });
});
