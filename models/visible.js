'use strict';

const {Model, UUIDV4} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Visible extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here

    }
  }
  Visible.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    name: {
        type: DataTypes.STRING,
        allowNull: false
      },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    communityType: {
        type: DataTypes.STRING,
        allowNull: false
      },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        // defaultValue:"Standard",
      },
    size: {
        type: DataTypes.STRING,
        allowNull: false
      },
    interest: {
          type: DataTypes.STRING,
        allowNull: false
        },
    engagementLevel: {
            type: DataTypes.STRING,
        allowNull: false
          },
    communicationPlatform: {
          type: DataTypes.STRING,
        allowNull: false
        },
    price: {
            type: DataTypes.FLOAT,
        allowNull: false
          },
    accessType: {
            type: DataTypes.STRING,
            allowNull: false,
            // defaultValue:"Standard",
          },
    frequency: {
            type: DataTypes.FLOAT,
            allowNull: true
            },
    days: {
            type: DataTypes.FLOAT,
            allowNull: true
            },
    contentType: {
            type: DataTypes.STRING,
            allowNull: false
            },
    platformLink: {
            type: DataTypes.STRING,
            allowNull: false,
                // defaultValue:"Standard",
            },
    email: {
            type: DataTypes.STRING,
            allowNull: true
            },
    phone: {
            type: DataTypes.STRING,
            allowNull: true
            },
    imageUrl: {
                type: DataTypes.STRING,
                allowNull: true
              },
    usp: {
              type: DataTypes.STRING,
              allowNull: true
            },
    recognition: {
                type: DataTypes.STRING,
                allowNull: true
              },
    additionalService: {
                type: DataTypes.STRING,
                allowNull: true,
              },
    whatsapp: {
                type: DataTypes.STRING,
                allowNull: true
              },
               

  }, {
    sequelize,
    modelName: 'Visible',
  });
  return Visible;
};