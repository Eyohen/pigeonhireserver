// models/communityReview.js
'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommunityReview extends Model {
    static associate(models) {
      CommunityReview.belongsTo(models.Community, { 
        foreignKey: 'communityId', 
        as: 'Community' 
      });
      CommunityReview.belongsTo(models.User, { 
        foreignKey: 'reviewerId', 
        as: 'Reviewer' 
      });
    }
  }
  
  CommunityReview.init({
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
    communityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Communities',
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
    modelName: 'CommunityReview',
    tableName: 'CommunityReviews'
  });
  
  return CommunityReview;
};