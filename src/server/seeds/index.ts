import { sequelize } from '../db.ts';
import { seed } from './seed.ts';

try {
  await seed();
  console.info('[kiddin] Seeded threads, users and posts.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
