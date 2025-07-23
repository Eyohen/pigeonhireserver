// models/userAnalytics.js
"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserAnalytics extends Model {
    static associate(models) {
      // Each analytics record belongs to a user
      UserAnalytics.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  UserAnalytics.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: 'CASCADE'
      },
      totalContacted: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      profilesViewed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      leads: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      networks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "UserAnalytics",
      tableName: "UserAnalytics"
    }
  );
  return UserAnalytics;
};

