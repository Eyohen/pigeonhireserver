'use strict';

const { Model, UUIDV4 } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    User.hasMany(models.Visible, { foreignKey: 'userId' });
    User.hasMany(models.CollaborationType, { foreignKey: 'userId' });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
  
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue:'USD'
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:'user'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
  verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
  },
  resetPasswordOTP:{
    type:DataTypes.STRING,
    allowNull:true
  },
  resetPasswordToken:{
    type: DataTypes.STRING,
    allowNull:true
  },

  resetPasswordExpires:{
    type: DataTypes.DATE,
    allowNull:true
  },

  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};