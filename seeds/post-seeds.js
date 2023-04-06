// Import model required in seeds
const { Post } = require('../models');

const THREAD_MARKETPLACE = 1;
const THREAD_CONFESSIONS = 2;
const THREAD_GUESSMYKID = 3;

const USER_JESS = 1;
const USER_LEO = 2;
const USER_ALICIA = 3;

// Define seed data
const postData = [
	{
		title: 'Buy my baby\'s nappies',
		text: 'Half price, brand new, come and get it! 2 packs for only $35.00',
		image_url: '/images/seeds/babynappies.jpg',
		price: 35.00,
		thread_id: THREAD_MARKETPLACE,
		user_id: USER_JESS
	},
	{
		title: 'Balance Bike',
		text: 'Balance bike big fun for any baby from 2 years old',
		image_url: '/images/seeds/balancebike.jpg',
		price: 30.00,
		thread_id: THREAD_MARKETPLACE,
		user_id: USER_ALICIA
	},
	{
		title: '3 baby bottles',
		text: 'Never used',
		image_url: '/images/seeds/babybottles.jpg',
		price: 15.00,
		thread_id: THREAD_MARKETPLACE,
		user_id: USER_ALICIA
	},
	{
		title: 'I ate my baby\'s candy',
		text: 'It was 3am. I went downstairs to raid the fridge but there was no food except my baby\'s candy. I\'m such a bad person.',
		image_url: '/images/seeds/candy.jpg',
		thread_id: THREAD_CONFESSIONS,
		user_id: USER_LEO
	},
	{
		title: 'So last night...',
		text: 'I pretended to be asleep so my baby would fall asleep too. I\'m so bad!',
		image_url: '/images/seeds/pretendsleep.jpg',
		price: 30.00,
		thread_id: THREAD_CONFESSIONS,
		user_id: USER_ALICIA
	},
	{
		title: 'I yelled at my kid',
		text: 'I couldn\'t control myself...',
		image_url: '/images/seeds/confessionangry.jpeg',
		price: 30.00,
		thread_id: THREAD_CONFESSIONS,
		user_id: USER_ALICIA
	},
	{
		title: 'You\'ll never get this one!',
		text: 'Clues: it\'s related to food',
		image_url: '/images/seeds/cryingbaby.jpg',
		thread_id: THREAD_GUESSMYKID,
		user_id: USER_JESS
	},
	{
		title: 'Baby after a feed',
		text: 'What am I doing wrong?',
		image_url: '/images/seeds/angrybaby.jpg',
		thread_id: THREAD_GUESSMYKID,
		user_id: USER_JESS
	}
];

// Seed function using Sequelize API to create multiple posts
const seedPosts = () => Post.bulkCreate(postData);

// Export seed function
module.exports = seedPosts;
