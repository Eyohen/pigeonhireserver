
// models/network.js
"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Network extends Model {
    static associate(models) {
      Network.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Network.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community'
      });
      
      Network.belongsTo(models.Connector, {
        foreignKey: 'connectorId',
        as: 'connector'
      });
    }
  }
  
  Network.init(
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
      networkType: {
        type: DataTypes.ENUM('community', 'connector'),
        allowNull: false
      },
      connectionStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        defaultValue: 'pending'
      },
      relationshipType: {
        type: DataTypes.STRING, // mentor, partner, collaborator, etc.
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Network",
      tableName: "Networks"
    }
  );
  return Network;
};