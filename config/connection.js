// import Sequelize object
import Sequelize from 'sequelize';

// load .env file contents into process.env
import dotenv from 'dotenv'
dotenv.config();

// create new Sequelize object depending on whether Heroku is used
let sequelize;

// if Heroku is used
if (process.env.JAWSDB_URL) {
	sequelize = new Sequelize(process.env.JAWSDB_URL);

	// if not
} else {
	sequelize = new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: 'localhost',
			dialect: 'mysql',
			port: 3306
		}
	);
}

export default sequelize;
