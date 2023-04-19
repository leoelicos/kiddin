import  Thread from './Thread.js';
import User from './User.js';
import Post from './Post.js';

Post.belongsTo(Thread, {
	foreignKey: 'thread_id',
}); 

Thread.hasMany(Post, {
	foreignKey: 'thread_id',
	onDelete: 'CASCADE',
});

Post.belongsTo(User, {
	foreignKey: 'user_id',
});

User.hasMany(Post, {
	foreignKey: 'user_id',
	onDelete: 'CASCADE',
});

export    { Thread, User, Post };
