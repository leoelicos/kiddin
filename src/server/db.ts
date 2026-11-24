import fs from 'node:fs';
import path from 'node:path';
import { Sequelize, type Options } from 'sequelize';
import { config } from './config.ts';

/** Hosted Postgres (Neon, Render, Supabase…) needs TLS; plain localhost does not. */
function postgresSsl(url: string | undefined, host: string): Options['dialectOptions'] {
  const target = url ?? host;
  const local = /(^|@|\/\/)(localhost|127\.0\.0\.1|\[?::1\]?)(:|\/|$)/i.test(target);
  const disabled = /[?&]sslmode=disable(&|$)/i.test(target);
  if (local || disabled) return undefined;
  return { ssl: { require: true, rejectUnauthorized: true } };
}

function createSequelize(): Sequelize {
  const logging = false;
  const { db } = config;

  if (db.dialect === 'sqlite') {
    if (db.storage !== ':memory:') fs.mkdirSync(path.dirname(db.storage), { recursive: true });
    return new Sequelize({ dialect: 'sqlite', storage: db.storage, logging });
  }

  const options: Options = { dialect: db.dialect, logging };
  if (db.dialect === 'postgres') {
    options.dialectOptions = postgresSsl(db.url, db.host);
    // Small pool: serverless Postgres poolers (e.g. Neon's) multiplex for us.
    options.pool = { max: 5, idle: 10_000 };
  }

  if (db.url) return new Sequelize(db.url, options);
  return new Sequelize(db.name, db.user, db.password, { ...options, host: db.host, port: db.port });
}

export const sequelize = createSequelize();
