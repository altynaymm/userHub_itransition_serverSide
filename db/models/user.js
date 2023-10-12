/* eslint-disable import/no-extraneous-dependencies */
const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: DataTypes.STRING,
    lastLoginDate: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('active', 'blocked', 'deleted'),
      defaultValue: 'active',
    },

  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
