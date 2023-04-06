// Import model required in seeds
const { Thread } = require('../models');

// Define seed data
const threadData = [
	{
		title: 'Marketplace: Buy and Sell Baby Stuff',
		img:'/images/baby-items.png'
	},
	{
		title: 'Confessions: What Have I done to my baby?',
		img:'/images/babySurprise.jpg'
	},
	{
		title: 'Guess what my kid is mad about?',
		img:'/images/angry-baby.jpg'
	},
];

// Seed function using Sequelize API to create multiple threads
const seedThread = () => Thread.bulkCreate(threadData);

// Export seed function
module.exports = seedThread;