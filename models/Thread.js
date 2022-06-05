/*
 * Just Kidding
 * models/Thread.js
 * This model defines entity Thread
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

// Sequelize API to import database classes
const { Model, DataTypes } = require('sequelize');

// Sequelize API to import SQL connection
const sequelize = require('../config/connection');

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
module.exports = Thread;
