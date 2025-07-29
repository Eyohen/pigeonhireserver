// models/subscription.js
'use strict';

const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // Subscription belongs to a user
      Subscription.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Subscription references currency for pricing
      Subscription.belongsTo(models.Currency, {
        foreignKey: 'currencyId',
        as: 'currencyDetails'
      });
    }
  }

  Subscription.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    currencyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Currencies',
        key: 'id'
      }
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    planType: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annually'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'cancelled', 'expired', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true, // 'card', 'bank_transfer', etc.
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true, // For storing additional Stripe metadata
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'Subscriptions',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['stripeSubscriptionId']
      }
    ]
  });

  return Subscription;
};