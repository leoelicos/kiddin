// import express router
const router = require('express').Router();

// import models required in routes
const { Thread, Post, User } = require('../models');

// import custom middleware to redirect users if they are not logged in
const withAuth = require('../utils/auth');

// define HTTP Response Status Codes
const INTERNAL_SERVER_ERROR = 500;

// Route handler to render homepage and all threads
router.get('/', async (req, res) => {
	// get login parameter from session
	const { logged_in } = req.session;

	try {
		// Sequelize API to find all threads
		const threadData = await Thread.findAll();

		// Sequelize API to serialize each iteration
		const threads = threadData.map((thread) => thread.get({ plain: true }));

		// Render the homepage along with all of its threads
		res.render('homepage', {threads, logged_in});

		// Respond with any error and status INTERNAL SERVER ERROR
	} catch (err) {
		res.status(INTERNAL_SERVER_ERROR).json(err);
	}
});

// Route handler to render a thread and all its posts
router.get('/thread/:id', withAuth, async (req, res) => {

	// Get thread id from req.params
	const { id } = req.params;

	// Get login status from req.session
	const { logged_in } = req.session;

	try {
		// Sequelize API to find a thread by its primary key
		const threadData = await Thread.findByPk(id);

		// Sequelize API to serialize thread data
		const thread = threadData.get({ plain: true });

		// Sequelize API to find a thread by its primary key
		// order data descendingly to render the latest post at the top
		const postsData = await Post.findAll({
			where: { thread_id: id },
			include: [
				{
					model: User,
					attributes: ['username'],
				},
				{
					model: Thread,
					attributes: ['title'],
				},
			],
			order: [[ 'id', 'DESC' ]]
		});

		// Sequelize API to serialize each iteration
		const posts = postsData.map((postData) => postData.get({ plain: true }));

		// Flag to indicate thread is marketplace
		const marketplaceId = '1';
		const isMarketplace = (id === marketplaceId);

		// Render the thread along with all of its posts
		res.render('thread', { thread, posts, logged_in, isMarketplace });

		// Respond with any error and status INTERNAL SERVER ERROR
	} catch (err) {
		res.status(INTERNAL_SERVER_ERROR).json(err);
	}
});

// Route handler for /login
router.get('/login', (req, res) => {

	// get logged_in parameter from session
	const { logged_in } = req.session;

	// if logged in, redirect to homepage
	if (logged_in) {
		res.redirect('/');
		return;
	}

	// if not logged in, render login page
	res.render('login');
});

module.exports = router;
