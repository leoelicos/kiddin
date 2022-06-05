/*
 * Just Kidding
 * login.js
 * This script contains the necessary code to allow a logged-in user to log out
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

// Function to send POST fetch to logout a user
const logout = async () => {
  try {

    // Send POST fetch to api/users/logout
    const response = await fetch('/api/users/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    // If the response was not successful, alert the user
    if (!response.ok) {
      window.alert(response.statusText);
      return;
    }

  // Return any error in the console
  } catch (error) {
    console.log(error);
  }

  // Send the user to the homepage
  document.location.replace('/');
};

// get logout element, add event listener for 'click', delegate to loginFormHandler
document.querySelector('#logout').addEventListener('click', logout);
