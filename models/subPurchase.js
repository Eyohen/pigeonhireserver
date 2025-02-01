'use strict';

const {Model, UUIDV4} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SubPurchase extends Model {
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

 
    static associate(models) {
      // define association here
SubPurchase.belongsTo(models.User, {
    foreignKey: 'userId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
    }
  }
  SubPurchase.init({

    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    type: {
        type: DataTypes.STRING, // whether monthly, quarterly or annually
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
    firstName:{
        type: DataTypes.STRING,
        allowNull: true    
          },
    // lastName:{
    //     type: DataTypes.STRING,
    //     allowNull: true    
    //       },
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
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
        }
    
  }, {
    sequelize,
    modelName: 'SubPurchase',
  });
  return SubPurchase;
};