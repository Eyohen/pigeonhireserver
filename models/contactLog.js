
// models/contactLog.js
"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ContactLog extends Model {
    static associate(models) {
      ContactLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      ContactLog.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community'
      });
      
      ContactLog.belongsTo(models.Connector, {
        foreignKey: 'connectorId',
        as: 'connector'
      });
    }
  }
  
  ContactLog.init(
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
      contactType: {
        type: DataTypes.ENUM('community', 'connector'),
        allowNull: false
      },
      contactMethod: {
        type: DataTypes.STRING, // email, whatsapp, telegram, etc.
        allowNull: true
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'responded', 'closed'),
        defaultValue: 'pending'
      }
    },
    {
      sequelize,
      modelName: "ContactLog",
      tableName: "ContactLogs"
    }
  );
  return ContactLog;
};