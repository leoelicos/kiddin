import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';
import { config } from './config.ts';

function createSequelize(): Sequelize {
  const logging = false;
  const { db } = config;

  if (db.dialect === 'sqlite') {
    if (db.storage !== ':memory:') fs.mkdirSync(path.dirname(db.storage), { recursive: true });
    return new Sequelize({ dialect: 'sqlite', storage: db.storage, logging });
  }
  if (db.url) return new Sequelize(db.url, { dialect: 'mysql', logging });
  return new Sequelize(db.name, db.user, db.password, {
    dialect: 'mysql',
    host: db.host,
    port: db.port,
    logging,
  });
}

export const sequelize = createSequelize();
