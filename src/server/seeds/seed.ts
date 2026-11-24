import { sequelize } from '../db.ts';
import { Post, Thread, User } from '../models/index.ts';
import * as data from './data.ts';

/** Drops and recreates all tables, then inserts the demo data. */
export async function seed(): Promise<void> {
  await sequelize.sync({ force: true });
  await Thread.bulkCreate(data.threads);
  await User.bulkCreate(data.users, { individualHooks: true });
  await Post.bulkCreate(data.posts);
}
