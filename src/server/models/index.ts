import { Post } from './Post.ts';
import { Thread } from './Thread.ts';
import { User } from './User.ts';

Post.belongsTo(Thread, { foreignKey: 'thread_id' });
Thread.hasMany(Post, { foreignKey: 'thread_id', onDelete: 'CASCADE' });

Post.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Post, { foreignKey: 'user_id', onDelete: 'CASCADE' });

export { Post, Thread, User };
