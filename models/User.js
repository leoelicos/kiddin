/*
 * Just Kidding
 * models/User.js
 * This model defines entity User
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

// Sequelize API to import database classes
const { Model, DataTypes } = require('sequelize');

// Import bcrypt utility to encrypt password
const bcrypt = require('bcrypt');

// Sequelize API to import SQL connection
const sequelize = require('../config/connection');

// Create new class that extends Sequelize Model
class User extends Model {

	// Instance method to check password
	checkPassword(loginPw) {

		// bcrypt API  to compare query value with database value
		return bcrypt.compareSync(loginPw, this.password);
	}
}

// Sequelize API to initialize an entity
User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [8],
			},
		},
	},
	{
		hooks: {
			// modify User password before a User is created
			async beforeCreate(user) {
				// encrypt a new user's password
				const encrypted = await bcrypt.hash(user.password, 10);

				// overwrite the user's password with the encrypted one
				user.password = encrypted;

				// return user to continue creating
				return user;
			},
		},
		sequelize,
		timestamps: false,
		freezeTableName: true,
		underscored: true,
		modelName: 'user',
	}
);

// Export User model
module.exports = User;