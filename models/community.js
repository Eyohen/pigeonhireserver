// models/community.js 
"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Community extends Model {
    static associate(models) {
      // Connector association
      Community.hasMany(models.Connector, {
        sourceKey: 'name',
        foreignKey: 'communityName',
        as: 'connectors'
      });

      // Review associations
      Community.hasMany(models.Review, {
        foreignKey: 'communityId',
        as: 'reviews'
      });

      // Favorites association
      Community.hasMany(models.UserFavorite, {
        foreignKey: 'communityId',
        as: 'favoritedBy'
      });

      // Analytics associations
      Community.hasMany(models.ContactLog, {
        foreignKey: 'communityId',
        as: 'contactLogs'
      });

      Community.hasMany(models.ProfileView, {
        foreignKey: 'communityId',
        as: 'profileViews'
      });

      Community.hasMany(models.Lead, {
        foreignKey: 'communityId',
        as: 'leads'
      });

      Community.hasMany(models.Network, {
        foreignKey: 'communityId',
        as: 'networks'
      });


      Community.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  Community.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    restrict: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    communityType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    commTypeCategory: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    communityInterest: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    established: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    engagementLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contentShared: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    communicationPlatform: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    communityGoal: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    usp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recognition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    additionalService: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    communicationCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accessType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telegram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    days: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    connCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    platformLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Owners",
        key: "id",
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: 'CASCADE'
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 5
    },
  }, {
    sequelize,
    modelName: "Community",
    tableName: "Communities"
  });
  return Community;
};