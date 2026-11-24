import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from 'sequelize';
import { sequelize } from '../db.ts';
import type { Thread } from './Thread.ts';
import type { User } from './User.ts';

export class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare text: string;
  declare image_url: string | null;
  /** Author-supplied alt text (added in v2; nullable so v1 rows stay valid). */
  declare image_alt: CreationOptional<string | null>;
  declare price: number | null;
  declare date: CreationOptional<Date>;
  declare thread_id: ForeignKey<Thread['id']>;
  declare user_id: ForeignKey<User['id']>;

  declare user?: NonAttribute<User>;
  declare thread?: NonAttribute<Thread>;
}

Post.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    image_url: { type: DataTypes.STRING },
    image_alt: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.FLOAT },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, timestamps: false, freezeTableName: true, underscored: true, modelName: 'post' },
);
