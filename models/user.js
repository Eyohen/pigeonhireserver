'use strict';

const { Model, UUIDV4 } = require('sequelize');

const RoleType = {
  User: 'user',
  Admin: 'admin',
};

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    //   User.belongsToMany(models.Project, {
    //     through: 'ProjectAssignments', 
    //     foreignKey: 'userId'
    //   });
    //   User.belongsTo(models.Booking, {
    //     foreignKey: 'bookingId'
    //   });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true
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
    role: {
      type: DataTypes.ENUM,
      values: Object.values(RoleType),
      allowNull: false,
      defaultValue: RoleType.User,
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