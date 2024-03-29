 
import express from 'express';
import session from 'express-session';
import  exphbs from 'express-handlebars';
import  routes from './controllers/index.js';
import  helpers from './utils/helpers.js';

import sequelize from './config/connection.js';
import connectSessionSequelize from 'connect-session-sequelize'

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


const  SequelizeStore = connectSessionSequelize(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Handlebars.js engine with custom helpers
const hbs = exphbs.create({ helpers });

const sess = {
	secret: process.env.SESSION_SECRET,
	cookie: {
		// maxAge sets the maximum age for the session to be active. Listed in milliseconds.
		// 15 minutes
		maxAge: 900000,
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
