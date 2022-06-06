/*
 * Just Kidding
 * seeds/user-seeds.js
 * This script contains the seeds for the User entity
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

// Import model required in seeds
const { User } = require('../models');

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
module.exports = seedUser;
