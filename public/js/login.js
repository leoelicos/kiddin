// Function to send POST fetch to login a user
const loginFormHandler = async (event) => {

	// Prevent default button behaviour that would otherwise reload the page
	event.preventDefault();

	// Collect values from the login form
	const emailEl = document.querySelector('#input-email-login');
	const email = emailEl.value.trim();
	const passwordEl = document.querySelector('#input-password-login');
	const password = passwordEl.value.trim();

	// Check that neither field is empty
	if (!email || !password) {
		window.alert('Please check your email and password fields');
		return;
	}

	try {
		// Send POST fetch to api/users/login
		const response = await fetch('/api/users/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
			headers: { 'Content-Type': 'application/json' },
		});

		// If the response was not successful, alert the user
		if (!response.ok) {
			window.alert(response.statusText);
			return;
		}

		// Return any error in the console
	} catch (error) {
		console.error(error);
	}

	// Send the user to the homepage
	document.location.replace('/');
};

// Function to send POST fetch to signup a user
const signupFormHandler = async (event) => {

	// Prevent default button behaviour that would otherwise reload the page
	event.preventDefault();

	// Collect values from the signup form
	const usernameEl = document.querySelector('#input-username-signup');
	const username = usernameEl.value.trim();
	const email = document.querySelector('#input-email-signup').value.trim();
	const password = document.querySelector('#input-password-signup').value.trim();

	// Check that no fields are empty, although this will also be enforced from the HTML input element
	if (!username || !email || !password) {
		window.alert('Please fill in all fields');
		return;
	}

	try {
		// Send POST fetch to api/users
		const response = await fetch('/api/users/', {
			method: 'POST',
			body: JSON.stringify({ username, email, password }),
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			window.alert(response.statusText);
		}

		// Return any error in the console
	} catch (error) {
		console.error(error);
	}

	// Send the user to the homepage
	document.location.replace('/');
};

// get login form element, add event listener for 'submit', delegate to loginFormHandler
document.querySelector('.login-form').addEventListener('submit', loginFormHandler);

// get signup form element, add event listener for 'submit', delegate to signupFormHandler
document.querySelector('.signup-form').addEventListener('submit', signupFormHandler);
