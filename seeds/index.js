// Import seedThreads method
const seedThreads = require('./thread-seeds');

// Import seedUsers method
const seedUsers = require('./user-seeds');

// Import seedPosts method
const seedPosts = require('./post-seeds');

// Sequelize API to import SQL connection
const sequelize = require('../config/connection');

// Execute seed methods in order
const seedAll = async () => {
	try {
		// Sequelize API to initiate SQL connection
		await sequelize.sync({ force: true });

		// Seed Threads
		await seedThreads();

		// Seed Users
		await seedUsers();

		// Seed Posts
		await seedPosts();

		// return any error
	} catch (error) {
		console.error(error);

		// exit the script
	} finally {
		process.exit(0);
	}
};

seedAll();
