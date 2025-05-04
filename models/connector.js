"use strict";

const { Model, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Connector extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
        Connector.belongsTo(models.Community, {
          targetKey:'name',
          foreignKey: 'communityName',
          as: 'community'
        });

    }
  }
  Connector.init(
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
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sourceOfInfo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      connectionType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      connectionPlatform: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accessRequirement: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otherContact: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      instagram: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkedIn: {
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
      communityName: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "Communities",
          key: "name"
        }
      }
     
    },  
    {
      sequelize,
      modelName: "Connector",
     
    }
  );
  return Connector;
};
