// custom middleware function to redirect a user to the login page if they are not logged in to the session
const withAuth = (req, res, next) => {

	// get logged_in parameter from req.session
	const { logged_in } = req.session;

	// If the user is not logged in, redirect the request to the login route
	if (!logged_in) {
		res.redirect('/login');
		return;
	}

	// execute the next middleware
	next();
};

// Export the custom middleware function
module.exports = withAuth;
