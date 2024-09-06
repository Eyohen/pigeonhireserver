'use strict';

const {Model, UUIDV4} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CollaborationType extends Model {
   
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
CollaborationType.belongsTo(models.User, { foreignKey: 'userId' });
CollaborationType.belongsTo(models.Community, { 
    foreignKey: 'communityId',
    as: 'community'
  });
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
          },
    amount: {
        type: DataTypes.DECIMAL(10,3),
        defaultValue: 0,
        allowNull: false
          },
    currency: {
        type: DataTypes.STRING,
        allowNull: false    
          },
    userId: {
            type: DataTypes.UUID,
            allowNull: false,
            },
    communityId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: 'Communities',
        key: 'id'
        }
    },
    
  }, {
    sequelize,
    modelName: 'CollaborationType',
  });
  return CollaborationType;
};