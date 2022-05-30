const seedThreads = require('./thread-seeds');
const seedUsers = require('./user-seeds');
const seedPosts = require('./post-seeds');

const sequelize = require('../config/connection');

const seedAll = async () => {
  await sequelize.sync({ force: true });

  await seedThreads();

  await seedUsers();

  await seedPosts();

  process.exit(0);
};

seedAll();
