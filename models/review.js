'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Association for user being reviewed
      Review.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'User' 
      });
      
      // Association for reviewer
      Review.belongsTo(models.User, { 
        foreignKey: 'reviewerId', 
        as: 'Reviewer' 
      });
      
   
     
    }
  }
  
  Review.init({
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
    // This field refers to the user being reviewed (optional if reviewing a community)
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
  
    // This field refers to who created the review
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Type of review - 'user' or 'community'
    reviewType: {
      type: DataTypes.ENUM('user', 'community'),
      allowNull: false,
      defaultValue: 'user'
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  
  return Review;
};