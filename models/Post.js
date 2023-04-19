// Sequelize API to import database classes
import { Model, DataTypes } from 'sequelize';

// Sequelize API to import SQL connection
import sequelize from '../config/connection.js';

// Create new class that extends Sequelize Model
class Post extends Model {}

// Sequelize API to initialize an entity
Post.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		text: {
			type: DataTypes.STRING,
			allowNull: false
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		image_url: {
			type: DataTypes.STRING
		},
		price: {
			type: DataTypes.FLOAT,
		},
		date: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		thread_id: {
			type: DataTypes.INTEGER,
			references: {
				model: 'thread',
				key: 'id'
			}
		},
		user_id: {
			type: DataTypes.INTEGER,
			references: {
				model: 'user',
				key: 'id'
			}
		}
	},
	{
		sequelize,
		timestamps: false,
		freezeTableName: true,
		underscored: true,
		modelName: 'post'
	}
);

// Export Post model
export default Post;
