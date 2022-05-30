const seedThreads = require('./thread-seeds');
const seedUsers = require('./user-seeds');
const seedPosts = require('./post-seeds');

const sequelize = require('../config/connection');

const seedAll = async () => {
  await sequelize.sync({ force: true });
  //   console.log('\n----- DATABASE SYNCED -----\n');
  await seedPosts();
  //   console.log('\n----- CATEGORIES SEEDED -----\n');

  await seedThreads();
  //   console.log('\n----- PRODUCTS SEEDED -----\n');

  await seedUsers();
  //   console.log('\n----- TAGS SEEDED -----\n');

  process.exit(0);
};

seedAll();
