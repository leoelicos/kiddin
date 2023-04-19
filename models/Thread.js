// Sequelize API to import database classes
import { Model, DataTypes } from 'sequelize';

// Sequelize API to import SQL connection
import sequelize from '../config/connection.js';

// Create new class that extends Sequelize Model
class Thread extends Model { }

// Sequelize API to initialize an entity
Thread.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		img:{
			type: DataTypes.STRING,
			allowNull: false,
		}
	},
	{
		sequelize,
		timestamps: false,
		freezeTableName: true,
		underscored: true,
		modelName: 'thread',
	}
);

// Export Thread model
export default Thread;
