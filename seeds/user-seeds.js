// Import model required in seeds
import  { User } from '../models/index.js';

// Define seed data
const userData = [
	{
		username:'Jess',
		email:'jess@jess.com',
		password:'jessiscool'
	},
	{
		username:'Leo',
		email:'leo@leo.com',
		password:'leoiscool'
	},
	{
		username:'Ali',
		email:'ali@ali.com',
		password:'aliiscool'
	}

];

// Seed function using Sequelize API to create multiple users
// Flag to encrypt user passwords
const seedUser = () => User.bulkCreate(userData, {individualHooks: true});

// Export seed function
export default seedUser;
