'use strict';

const {Model, UUIDV4} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PublicOwner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      PublicOwner.hasMany(models.Comunity, {
        foreignKey: 'PublicownerId',
        as: 'communities'
      });

      // PublicOwner.belongsTo(models.User, {
      //   foreignKey: 'user',
      //   as: 'user'
      // });
    }
  }
  PublicOwner.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique:true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    restrict: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
},
    name: {
        type: DataTypes.STRING,
        allowNull: false
      },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:'INVALID'
      },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
            type: DataTypes.STRING,
            allowNull: true
              },
    rating: {
            type: DataTypes.STRING,
            allowNull: true
            },
    review: {
            type: DataTypes.ARRAY(DataTypes.STRING), 
            allowNull: true
              },
    recognition: {
            type: DataTypes.STRING,
            allowNull: true
            },
    whatsapp: {
            type: DataTypes.STRING,
            allowNull: true
              },
    telegram: {
              type: DataTypes.STRING,
              allowNull: true
                },
    twitter: {
              type: DataTypes.STRING,
              allowNull: true
                },
    user: {
      type: DataTypes.STRING,
      allowNull: true
    },
               

  }, {
    sequelize,
    modelName: 'PublicOwner',
   
  });
  return PublicOwner;
};