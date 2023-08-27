
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(sequelize.models.Comment, {
        foreignKey: 'email'
      })}
  }
  User.init({
    firstName:{ type: DataTypes.STRING,
      allowNull: false,
      validate: { // sequelize level validatioN
        is: /^[A-Za-z]+/i,
        notEmpty: true // this was added manually
      }},
    lastName: { type: DataTypes.STRING,
      allowNull: false,
      validate: { // sequelize level validatioN
        is: /^[A-Za-z]+/i,
        notEmpty: true // this was added manually
      }},
    email: { type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { // sequelize level validatioN
        notEmpty: true, // this was added manually
        isEmail: true // this was added manually
      }},
    password: { type: DataTypes.STRING,
      allowNull: false,
      validate: { // sequelize level validatioN
        notEmpty: true // this was added manually
      }}
  },  {
    sequelize,
    modelName: 'User',
  });
  /**
   * A beforeCreate hook for the Comment model that validates the email
   * @param {Object} comment - The comment object being created
   * @param {Object} options - The options object used by the Sequelize create method
   * @throws {Error} - if the email is already in use
   */
  User.beforeCreate((user, options) => {
    return User.findOne({ where: { email: user.email } })
        .then(existingUser => {
          if (existingUser) {
            throw new Error('Email already in use. Please, choose another one');
          }
        });
  });

  return User;
};

