/*
 * Just Kidding
 * This script contains the necessary code to implement the server for Just Kidding
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const helpers = require('./utils/helpers');

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Handlebars.js engine with custom helpers
const hbs = exphbs.create({ helpers });

const sess = {
  secret: 'Super secret secret',
  cookie: {
    // maxAge sets the maximum age for the session to be active. Listed in milliseconds.
    // 15 minutes
    maxAge: 15*60*60,
    // httpOnly tells express-session to only store session cookies when the protocol being used to connect to the server is HTTP
    httpOnly: true,
    // secure tells express-session to only initialize session cookies when the protocol being used is HTTPS. Having this set to be true, and running a server without encryption will
    secure: false,
    // sameSite tells express-session to only initialize session cookies when the referrer provided by the client  mathces the domain our server is hosted from.
    sameSite: 'strict'
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize
  })
};

app.use(session(sess));

// Inform Express.js on which template engine to use
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});
