

// models/profileView.js
"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProfileView extends Model {
    static associate(models) {
      ProfileView.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      ProfileView.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community'
      });
      
      ProfileView.belongsTo(models.Connector, {
        foreignKey: 'connectorId',
        as: 'connector'
      });
    }
  }
  
  ProfileView.init(
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
      communityId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Communities",
          key: "id",
        },
        onDelete: 'CASCADE'
      },
      connectorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Connectors",
          key: "id",
        },
        onDelete: 'CASCADE'
      },
      profileType: {
        type: DataTypes.ENUM('community', 'connector'),
        allowNull: false
      },
      viewDuration: {
        type: DataTypes.INTEGER, // in seconds
        allowNull: true
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "ProfileView",
      tableName: "ProfileViews"
    }
  );
  return ProfileView;
};
