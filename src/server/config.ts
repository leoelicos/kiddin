import path from 'node:path';
import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  SESSION_SECRET: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JAWSDB_URL: z.string().optional(),
  DB_DIALECT: z.enum(['mysql', 'sqlite']).optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  SQLITE_STORAGE: z.string().default('.data/kiddin.sqlite'),
  UPLOAD_DIR: z.string().default('uploads'),
});

const env = Env.parse(process.env);

const isProd = env.NODE_ENV === 'production';
const databaseUrl = env.DATABASE_URL ?? env.JAWSDB_URL;
const dialect = env.DB_DIALECT ?? (databaseUrl || env.DB_NAME ? 'mysql' : 'sqlite');

if (isProd && !env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production.');
}
if (isProd && dialect === 'sqlite') {
  console.warn('[kiddin] Running production on SQLite. Set DATABASE_URL for MySQL.');
}

const root = process.cwd();

export const config = {
  env: env.NODE_ENV,
  isProd,
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,
  sessionSecret: env.SESSION_SECRET ?? 'kiddin-dev-only-secret-change-me',
  db: {
    dialect,
    url: databaseUrl,
    name: env.DB_NAME ?? 'jk_db',
    user: env.DB_USER ?? 'root',
    password: env.DB_PASSWORD ?? '',
    host: env.DB_HOST,
    port: env.DB_PORT,
    storage:
      env.SQLITE_STORAGE === ':memory:' ? ':memory:' : path.resolve(root, env.SQLITE_STORAGE),
  },
  uploadDir: path.resolve(root, env.UPLOAD_DIR),
  clientDir: path.resolve(root, 'dist/client'),
} as const;

export type Config = typeof config;
