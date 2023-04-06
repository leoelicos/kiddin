const Thread = require('./Thread');
const User = require('./User');
const Post = require('./Post');

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

module.exports = { Thread, User, Post };
