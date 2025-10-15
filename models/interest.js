'use strict';

const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interest extends Model{
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */


 
    static associate(models) {

    }
  }
 Interest.init({

    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    primaryType: {
            type: DataTypes.STRING,
            allowNull: false
          },
    secondaryType: {
            type: DataTypes.STRING,
            allowNull: true
          },

  }, {
    sequelize,
    modelName: 'Interest',
  });
  return Interest;
};