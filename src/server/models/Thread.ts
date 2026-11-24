import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db.ts';

export class Thread extends Model<InferAttributes<Thread>, InferCreationAttributes<Thread>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare img: string;
}

Thread.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    img: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, timestamps: false, freezeTableName: true, underscored: true, modelName: 'thread' },
);
