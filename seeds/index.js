// Import seedThreads method
import  seedThreads from './thread-seeds.js';

// Import seedUsers method
import seedUsers from './user-seeds.js';

// Import seedPosts method
import seedPosts from './post-seeds.js';

// Sequelize API to import SQL connection
import sequelize from '../config/connection.js';

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
