/*
 * Just Kidding
 * seeds/post-seeds.js
 * This script contains the seeds for the Post entity
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

// Import model required in seeds
const { Post } = require('../models');

// Define seed data
const postData = [
	{
		title: 'Buy my babys nappies',
		text: 'Half price, brand new, come and get it! 2 packs for only $35.00',
		image_url: 'https://www.bigw.com.au/medias/sys_master/images/images/h25/he8/16831808831518.jpg',
		price: 35.00,
		thread_id: 1,
		user_id: 1
	},
	{
		title: 'Balance Bike',
		text: 'Balance bike big fun for any baby from 2 years old',
		image_url: '/images/BalanceBike.jpg',
		price: 30.00,
		thread_id: 1,
		user_id: 1
	},

	{
		title: 'I ate my baby\'s candy',
		text: 'It was 3am. A dark, hot, hungry woman (me) went downstairs to raid the fridge but there was no food except my baby\'s candy. I\'m such a bad person.',
		image_url: 'https://sites.imsa.edu/acronym/files/2021/10/candy.jpg',
		thread_id: 2,
		user_id: 2
	},
	{
		title: 'You\'ll never get this one!',
		text: 'Clues: it\'s related to food',
		image_url: 'https://www.momtastic.com/assets/uploads/2016/03/angerharmsbabiesemotionally_sized-1280x720.jpg',
		thread_id: 3,
		user_id: 3
	}
];

// Seed function using Sequelize API to create multiple posts
const seedPosts = () => Post.bulkCreate(postData);

// Export seed function
module.exports = seedPosts;
