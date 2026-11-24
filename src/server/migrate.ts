import { DataTypes } from 'sequelize';
import { sequelize } from './db.ts';
import './models/index.ts';

/**
 * Creates missing tables, then applies additive, idempotent column changes so
 * databases created by Kiddin v1 upgrade in place without data loss.
 */
export async function migrate(): Promise<void> {
  await sequelize.sync();
  const qi = sequelize.getQueryInterface();
  const post = await qi.describeTable('post');
  if (!('image_alt' in post)) {
    await qi.addColumn('post', 'image_alt', { type: DataTypes.STRING, allowNull: true });
  }
}
