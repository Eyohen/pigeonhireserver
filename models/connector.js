// models/connector.js
"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Connector extends Model {
    static associate(models) {
      // Community association
      Connector.belongsTo(models.Community, {
        targetKey: 'name',
        foreignKey: 'communityName',
        as: 'community'
      });

      // Analytics associations
      Connector.hasMany(models.ContactLog, {
        foreignKey: 'connectorId',
        as: 'contactLogs'
      });

      Connector.hasMany(models.ProfileView, {
        foreignKey: 'connectorId',
        as: 'profileViews'
      });

      Connector.hasMany(models.Lead, {
        foreignKey: 'connectorId',
        as: 'leads'
      });

      Connector.hasMany(models.Network, {
        foreignKey: 'connectorId',
        as: 'networks'
      });

      // Review associations
      Connector.hasMany(models.Review, {
        foreignKey: 'connectorId',
        as: 'reviews'
      });

      // User ownership
      Connector.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  Connector.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    restrict: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sourceOfInfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    connectionType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    connectionPlatform: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accessRequirement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otherContact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedIn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telegram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    communityName: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "Communities",
        key: "name"
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: "Connector",
  });
  return Connector;
};