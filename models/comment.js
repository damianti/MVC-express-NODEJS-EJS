'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(sequelize.models.User, { foreignKey: 'email', targetKey:'email'});
    }
  }
  Comment.init({
    picDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
    text: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Comment',
  });

  /**
   * A beforeCreate hook for the Comment model that validates the picDate and sets the deleted attribute
   * @param {Object} comment - The comment object being created
   * @param {Object} options - The options object used by the Sequelize create method
   * @throws {Error} - if the picDate is in the future
   */
  Comment.beforeCreate((comment, options) => {
    if (comment.picDate > new Date()) {
      throw new Error('Invalid date, the date cannot be in the future');
    }
    comment.deleted = false;
  });

  return Comment;
};