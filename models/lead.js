
// models/lead.js
"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    static associate(models) {
      Lead.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Lead.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community'
      });
      
      Lead.belongsTo(models.Connector, {
        foreignKey: 'connectorId',
        as: 'connector'
      });
    }
  }
  
  Lead.init(
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
      leadType: {
        type: DataTypes.ENUM('community', 'connector'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('new', 'contacted', 'qualified', 'converted', 'lost'),
        defaultValue: 'new'
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      followUpDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Lead",
      tableName: "Leads"
    }
  );
  return Lead;
};
