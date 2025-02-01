'use strict';



const { Model, UUIDV4 } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Currency extends Model{
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */


 
    static associate(models) {
      // define association here
    }
  }
 Currency.init({

    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    currency: {
            type: DataTypes.STRING,
            allowNull: false
          },
    monthly: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0,
        allowNull: false
        },

    quarterly: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
        },

    annually: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
        },


  }, {
    sequelize,
    modelName: 'Currency',
  });
  return Currency;
};