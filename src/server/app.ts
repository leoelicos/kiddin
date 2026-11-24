import fs from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import connectSessionSequelize from 'connect-session-sequelize';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { config } from './config.ts';
import { sequelize } from './db.ts';
import { errorHandler } from './lib/http.ts';
import { PUBLIC_UPLOAD_PATH } from './lib/uploads.ts';
import { apiRouter } from './routes/index.ts';

const SequelizeStore = connectSessionSequelize(session.Store);

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Behind Heroku/Render/Fly etc. so `secure` cookies work.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'img-src': ["'self'", 'data:', 'blob:'],
          'style-src': ["'self'", "'unsafe-inline'"],
          'script-src': ["'self'"],
          'connect-src': ["'self'"],
          'font-src': ["'self'", 'data:'],
          'object-src': ["'none'"],
          'frame-ancestors': ["'none'"],
          'form-action': ["'self'"],
          'upgrade-insecure-requests': config.isProd ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());

  const store = new SequelizeStore({ db: sequelize, tableName: 'Sessions' });
  app.use(
    session({
      name: 'kiddin.sid',
      secret: config.sessionSecret,
      store,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        // 2 hours of inactivity (v1 was 15 minutes, which logged parents out mid-post).
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true,
        // HTTPS-only cookies whenever the request is secure (honours X-Forwarded-Proto via trust proxy).
        secure: config.isProd ? 'auto' : false,
        sameSite: 'lax',
      },
    }),
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  app.use('/api', apiRouter);
  app.use(
    PUBLIC_UPLOAD_PATH,
    express.static(config.uploadDir, { maxAge: '30d', immutable: true, fallthrough: false }),
  );

  // Serve the built SPA in production (and whenever a build exists).
  if (fs.existsSync(config.clientDir)) {
    app.use(
      express.static(config.clientDir, {
        index: false,
        setHeaders(res, file) {
          if (file.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      }),
    );
    const indexHtml = path.join(config.clientDir, 'index.html');
    app.get('/{*splat}', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexHtml);
    });
  }

  app.use(errorHandler);
  return { app, store };
}
