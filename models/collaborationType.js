'use strict';

const { Model, UUIDV4 } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class CollaborationType extends Model{
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

 
    static associate(models) {
      // define association here
      CollaborationType.belongsTo(models.Community, {
        foreignKey: 'communityId',
        as: 'community'
      }
  );
//   Community.hasOne(models.User, {
//     foreignKey: 'CommunityId',
//     as: 'User'
//   }
// )
    }
  }
  CollaborationType.init({

    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    collaborationType: {
            type: DataTypes.STRING,
            allowNull: false
          },
          duration: {
            type: DataTypes.STRING,
            allowNull: false
          },
          amount: {
            type: DataTypes.STRING,
            allowNull: false
          },
          communityId:{
            type: DataTypes.UUID,
            allowNull:false,
          },

  }, {
    sequelize,
    modelName: 'CollaborationType',
  });
  return CollaborationType;
};