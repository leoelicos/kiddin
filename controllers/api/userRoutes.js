// import express router
import express from 'express'

// import model required in user routes
import { User } from '../../models/index.js';

const router = express.Router();

// define HTTP Response Status Codes
const OK = 200;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

// Route handler to sign up a user
router.post('/', async (req, res) => {
	// Get parameters from req.body
	const newUser = req.body;

	try {

		// Sequelize API to create a user
		const userData = await User.create(newUser);

		// Sequelize API to serialize returned object
		const user = userData.get({ plain: true });

		// Session API to save session variables
		req.session.save(() => {
			req.session.user_id = user.id;
			req.session.logged_in = true;

			// Respond with user and status OK
			res.status(OK).json(user);
		});

		// Respond with any error and status BAD_REQUEST
	} catch (err) {
		res.status(BAD_REQUEST).json(err);
	}
});

// Route handler to log in a user
router.post('/login', async (req, res) => {
	// get parameters from req.body
	const { email, password } = req.body;

	// error message for missing user or missing password
	const missingMessage = 'Incorrect email or password, please try again';

	// validation message for successful login
	const loggedInMessage = 'You are now logged in!';

	try {

		// Sequelize API to find one user
		const userData = await User.findOne({ where: { email } });

		// If the user doesn't exist, respond with NOT FOUND and a message
		if (!userData) {
			res.status(NOT_FOUND).json({ missingMessage });
			return;
		}

		// Check the password matches the user
		const validPassword = userData.checkPassword(password);

		// If the password doesn't match the user, respond with BAD REQUEST and a message
		if (!validPassword) {
			res.status(BAD_REQUEST).json({ missingMessage });
			return;
		}

		// Session API to save session variables
		req.session.save(() => {
			req.session.user_id = userData.id;
			req.session.logged_in = true;

			// respond with OK and message
			res.status(OK).json({ loggedInMessage });
		});

		// respond with INTERNAL SERVER ERROR and the error
	} catch (err) {
		res.status(INTERNAL_SERVER_ERROR).json(err);
	}
});

// Route handler to log out a user
router.post('/logout', (req, res) => {
	// Get login status parameter from session
	const { logged_in } = req.session;

	// If user is logged in, then log out and return NO CONTENT
	if (logged_in) {
		req.session.destroy(() => {
			res.status(NO_CONTENT).end();
		});
		return;
	}

	// Return NOT FOUND
	res.status(NOT_FOUND).end();
});

export default router;
