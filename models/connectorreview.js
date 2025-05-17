// models/connectorReview.js
'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ConnectorReview extends Model {
    static associate(models) {
      ConnectorReview.belongsTo(models.Connector, { 
        foreignKey: 'connectorId', 
        as: 'Connector' 
      });
      ConnectorReview.belongsTo(models.User, { 
        foreignKey: 'reviewerId', 
        as: 'Reviewer' 
      });
    }
  }
  
  ConnectorReview.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    connectorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Connectors',
        key: 'id'
      }
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ConnectorReview',
    tableName: 'ConnectorReviews'
  });
  
  return ConnectorReview;
};