import { compare, hash } from 'bcryptjs';
import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { LIMITS } from '../../shared/types.ts';
import { config } from '../config.ts';
import { sequelize } from '../db.ts';

// Cheap hashes in tests only; 12 rounds (≈250ms) everywhere else.
const BCRYPT_ROUNDS = config.isTest ? 4 : 12;

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;

  /** Constant-time comparison; bcryptjs hashes are compatible with v1's native bcrypt hashes. */
  checkPassword(candidate: string): Promise<boolean> {
    return compare(candidate, this.password);
  }

  /** Public, password-free projection. */
  toPublic() {
    return { id: this.id, username: this.username };
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, LIMITS.usernameMax] },
    },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [LIMITS.passwordMin, 255] },
    },
  },
  {
    sequelize,
    // Table + column naming kept identical to v1 so existing databases keep working.
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'user',
    hooks: {
      async beforeCreate(user) {
        user.email = user.email.toLowerCase();
        user.password = await hash(user.password, BCRYPT_ROUNDS);
      },
    },
  },
);
