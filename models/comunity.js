"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comunity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
   
    }
  }
  Comunity.init(
    {
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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
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
        type: DataTypes.STRING,
        allowNull: true,
      },
      established: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      communityGoal: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      communityInterest: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interestCategory: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      engagementLevel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      communicationPlatform: {
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
        // defaultValue:"Standard",
      },
      frequency: {
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
      contentShared: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      platformLink: {
        type: DataTypes.STRING,
        allowNull: true,
        // defaultValue:"Standard",
      },
      imageUrl: {
        type: DataTypes.STRING,
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
    },  
    {
      sequelize,
      modelName: "Comunity",
       tableName: "Comunities"
    }
  );
  return Comunity;
};
