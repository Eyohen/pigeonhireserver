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
        allowNull: true
      },
    commTypeCategory:{
        type: DataTypes.STRING,
        allowNull:true
    },
    established:{
      type: DataTypes.STRING,
      allowNull:true
  },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      communityGoal: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
    size: {
        type: DataTypes.STRING,
        allowNull: false
      },
    communityInterest: {
          type: DataTypes.STRING,
        allowNull: true
        },
    interestCategory:{
          type: DataTypes.STRING,
          allowNull:true
      },
    engagementLevel: {
        type: DataTypes.STRING,
        allowNull: false
          },
    accessRequire: {
        type: DataTypes.STRING,
        allowNull: true
        },
    communicationPlatform: {
          type: DataTypes.STRING,
          allowNull: true
          },
      communicationCategory: {
            type: DataTypes.STRING,
            allowNull: true
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
            type: DataTypes.STRING,
            allowNull: true
            },
    days: {
            type: DataTypes.STRING,
            allowNull: true
            },

    connCategory: {
          type: DataTypes.STRING,
          allowNull: true
      },
      contentShared: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
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