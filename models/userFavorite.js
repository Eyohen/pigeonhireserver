'use strict';

const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserFavorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User can have many favorites
      UserFavorite.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Each favorite belongs to a community
      UserFavorite.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community'
      });
    }
  }

  UserFavorite.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    communityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Communities',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserFavorite',
    tableName: 'UserFavorites',
    // Ensure a user can't favorite the same community twice
    indexes: [
      {
        unique: true,
        fields: ['userId', 'communityId']
      }
    ]
  });

  return UserFavorite;
};