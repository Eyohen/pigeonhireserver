'use strict';

const {Model, UUIDV4} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Community extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      Community.hasMany(models.CollaborationType, {
        foreignKey: 'communityId',
        as: 'collaborationTypes'
      });

    }
  }
  Community.init({
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
    restrict: {
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
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        // defaultValue:"Standard",
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
    communicationPlatform: {
          type: DataTypes.STRING,
          allowNull: true
        },
    communicationCategory: {
          type: DataTypes.STRING,
          allowNull: true
      },
    connCategory: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contentShared: {
      type: DataTypes.STRING,
      allowNull: true
    },
    communityGoal: {
        type: DataTypes.STRING,
        allowNull: false
      },
    accessType: {
            type: DataTypes.STRING,
            allowNull: false,
            // defaultValue:"Standard",
          },
    prevCollabType: {
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
                // defaultValue:"Standard",
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
      allowNull: false
    },
               

  }, {
    sequelize,
    modelName: 'Community',
  });
  return Community;
};