'use strict';



const { Model, UUIDV4 } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Size extends Model{
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */


 
    static associate(models) {
      // define association here
//       Community.hasOne(models.USER, {
//         foreignKey: 'CommunityId',
//         as: 'Community'
//       }
//   ),
//   Community.hasOne(models.User, {
//     foreignKey: 'CommunityId',
//     as: 'User'
//   }
// )
    }
  }
 Size.init({

    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    size: {
            type: DataTypes.STRING,
            allowNull: false
          },

  }, {
    sequelize,
    modelName: 'Size',
  });
  return Size;
};