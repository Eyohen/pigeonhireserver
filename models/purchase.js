'use strict';

const {Model, UUIDV4} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

 
    static associate(models) {
      // define association here
Purchase.belongsTo(models.User, {
    foreignKey: 'userId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  Purchase.belongsTo(models.Community, {
    foreignKey: 'communityId',
    as: 'community',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  Purchase.belongsTo(models.CollaborationType, {
    foreignKey: 'collaborationTypeId',
    as: 'collaborationType',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

    }
  }
  Purchase.init({

    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
          },
    amount: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0,
        allowNull: false
          },
    currency:{
        type: DataTypes.STRING,
        allowNull: false    
          },
    communityName: {
        type: DataTypes.STRING,
        allowNull: true    
          },
    firstName:{
        type: DataTypes.STRING,
        allowNull: true    
          },
    lastName:{
        type: DataTypes.STRING,
        allowNull: true    
          },
    email:{
        type: DataTypes.STRING,
        allowNull: true    
            },
    userId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
              }
            },
    communityId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: 'Communities',
        key: 'id'
        }
    },
    collaborationTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CollaborationTypes',
        key: 'id'
      }
    },
    
  }, {
    sequelize,
    modelName: 'Purchase',
  });
  return Purchase;
};