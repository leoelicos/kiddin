# Kiddin’

> The parenting chaos club. Swap baby gear in the **Marketplace**, share **Confessions**, and make everyone **guess what your kid is mad about**.

Kiddin’ is a full-stack app where signed-in parents browse threads and post a photo, a title and a short story. Marketplace posts also carry a price.

**v2** is a ground-up modernisation of the 2022 bootcamp project (Express + Handlebars + Bootstrap). It is now a typed React single-page app on a hardened Express 5 API, with a new playful design system that is built and tested for **WCAG 2.2 AA**.

## Stack

| Layer    | Tech                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Web      | React 19, React Router (data router: loaders/actions, view transitions), Vite 8, strict TypeScript 7                             |
| Styling  | Hand-written modern CSS: design tokens with `light-dark()`, container queries, `:has()`, scroll-driven animations, `color-mix()` |
| Type     | Bricolage Grotesque (display) and Atkinson Hyperlegible Next (body, designed for low-vision readers), self-hosted via Fontsource |
| API      | Express 5 on Node ≥ 22.18, running TypeScript directly (native type stripping, no build step)                                    |
| Data     | Sequelize 6 on Postgres (e.g. Neon) or MySQL in prod, or zero-config SQLite in dev/test. Same tables and columns as v1           |
| Security | helmet (strict CSP), rate-limited auth, session regeneration, bcrypt, zod validation, EXIF/GPS stripping on uploads              |
| Quality  | oxlint (incl. `jsx-a11y`), Prettier, Vitest (API + components + axe-core), Playwright + `@axe-core/playwright` e2e               |

## Quick start

```sh
git clone https://github.com/leoelicos/kiddin.git && cd kiddin
npm install
npm run seed   # demo threads, users and posts (SQLite in .data/ by default)
npm run dev    # API on :3001 and web on http://localhost:5173
```

You don’t need MySQL for local development. Demo logins: `leo@leo.com` / `leoiscool`, `jess@jess.com` / `jessiscool`, `ali@ali.com` / `aliiscool`.

### Scripts

| Script             | What it does                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `npm run dev`      | API (`node --watch`) and Vite dev server, proxied together                                   |
| `npm run build`    | Type-check everything, then build the SPA to `dist/client`                                   |
| `npm start`        | Production server: API, uploads and the built SPA on `$PORT`                                 |
| `npm run seed`     | **Drops** and recreates tables with demo data                                                |
| `npm run check`    | typecheck, lint, format check and unit tests (what CI runs first)                            |
| `npm test`         | Vitest: API integration (supertest + SQLite), components (+ axe), tokens                     |
| `npm run test:e2e` | Playwright: real browser flows and axe WCAG 2.2 AA scans, light and dark, desktop and mobile |

The first `test:e2e` run needs `npx playwright install chromium`, or set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome.

## Configuration

Copy `.env.EXAMPLE` to `.env`. Everything is optional in development.

| Variable                                                  | Notes                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SESSION_SECRET`                                          | **Required in production.** A long random string                                            |
| `DATABASE_URL` / `JAWSDB_URL`                             | Postgres or MySQL URL; the scheme picks the dialect (`JAWSDB_URL` keeps Heroku working)     |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Discrete MySQL settings (the v1 setup)                                                      |
| `DB_DIALECT`, `SQLITE_STORAGE`                            | Force `postgres`, `mysql` or `sqlite`; SQLite file (default `.data/kiddin.sqlite`)          |
| `UPLOAD_DIR`                                              | Where photos are stored (default `uploads/`, served at `/data/uploads`)                     |
| `BLOB_READ_WRITE_TOKEN`                                   | Store photos in Vercel Blob (public store) instead of `UPLOAD_DIR`; deleted with their post |
| `PORT`                                                    | Default `3001`                                                                              |

## Deploying

Kiddin’ is a single Node process with a database and a writable upload directory. That fits Render, Railway, Fly.io or Heroku:

1. Build: `npm ci && npm run build`. Start: `npm start`.
2. Set `SESSION_SECRET` and `DATABASE_URL` (Postgres, e.g. a Neon pooled URL with `sslmode=require`, or MySQL).
3. Set `BLOB_READ_WRITE_TOKEN` (a public Vercel Blob store) so photos survive redeploys, or mount persistent storage for `UPLOAD_DIR`.

Tables are created on boot, and v1 databases are upgraded in place (one additive, nullable `post.image_alt` column).

## API

All endpoints are JSON under `/api`. The v1 endpoints keep their paths, fields and success shapes.

| Method | Path                 | Auth | Notes                                                                                                                                                                |
| ------ | -------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health`        |      | `{ ok: true }`                                                                                                                                                       |
| GET    | `/api/users/me`      |      | `{ loggedIn, user }` (new)                                                                                                                                           |
| POST   | `/api/users`         |      | Sign up `{ username, email, password }`. Returns `{ id, username }` (no password hash)                                                                               |
| POST   | `/api/users/login`   |      | `{ email, password }` → `{ loggedInMessage, user }`; bad credentials → **401**                                                                                       |
| POST   | `/api/users/logout`  | ✓    | 204, or 404 if not signed in                                                                                                                                         |
| GET    | `/api/threads`       |      | Threads with `postCount` and `isMarketplace` (new)                                                                                                                   |
| GET    | `/api/threads/:id`   | ✓    | `{ thread, posts, isMarketplace }`, newest first (new)                                                                                                               |
| POST   | `/api/posts/uploads` | ✓    | Multipart: `title`, `text`, `price`, `threadId`, `alt`, file `upload`. HTML forms get a 303 to the thread (v1 behaviour); `Accept: application/json` gets 201 + post |
| DELETE | `/api/posts/:id`     | ✓    | Author only                                                                                                                                                          |

Validation errors are `400 { message, issues: [{ path, message }] }`.

## Accessibility

Kiddin’ targets **WCAG 2.2 AA**, and automated checks enforce it:

- **Structure:** landmarks, one `h1` per page, logical headings, a skip link, a breadcrumb, `lang="en-AU"`, and page titles per route (React 19 `<title>`).
- **SPA navigation:** focus moves to `<main>` and the new page title is announced through a live region.
- **Keyboard:** everything is operable. The focus ring has two tones and stays visible on every surface. `scroll-padding` keeps focused elements clear of the sticky header (2.4.11). Delete confirmation uses a native `<dialog>`, which traps focus and closes on Esc.
- **Forms:** real labels, hints and errors linked through `aria-describedby`, `aria-invalid`, an error summary that takes focus, and character counters. `autocomplete` tokens are set and paste plus password managers are allowed (3.3.8). The show/hide password toggle uses `aria-pressed`.
- **Images:** authors can add alt text, with a sensible fallback. Decorative art is hidden from assistive tech.
- **Colour:** every token pair is contrast-tested in light and dark (`tests/contrast.test.ts`). The theme follows the OS, with a manual override, and supports forced colours.
- **Motion:** honours `prefers-reduced-motion`. Ambient animations finish within 5 s (2.2.2), and toasts pause on hover or focus.
- **Targets:** interactive controls are ≥ 40 px (2.5.8 asks for 24 px).
- **Tested:** axe-core in unit tests and in Playwright on every page, light and dark, desktop and mobile. `jsx-a11y` lint rules run in CI.

## Credits

Built by [asantidrian](https://github.com/asantidrian), [key16](https://github.com/key16) and [leoelicos](https://github.com/leoelicos). Modernised in 2026.

## License

[MIT](./LICENSE)
