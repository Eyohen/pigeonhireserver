// models/currency.js
'use strict';

const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static associate(models) {
      // Currency can be used in many subscriptions
      Currency.hasMany(models.Subscription, {
        foreignKey: 'currencyId',
        as: 'subscriptions'
      });
    }
  }

  Currency.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    monthly: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0,
      allowNull: false
    },
    monthlyPriceId: {
      type: DataTypes.STRING,
      allowNull: true, 
      comment: 'Stripe Price ID for monthly plan'
    },
    quarterly: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    quarterlyPriceId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Stripe Price ID for quarterly plan'
    },
    annually: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    annuallyPriceId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Stripe Price ID for annually plan'
    },
  }, {
    sequelize,
    modelName: 'Currency',
  });

  return Currency;
};