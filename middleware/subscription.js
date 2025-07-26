// File: middleware/subscription.js
const db = require('../models');
const { Subscription } = db;
const { Op } = require('sequelize');

// Middleware to check if user has active subscription
const requireActiveSubscription = async (req, res, next) => {
  try {
    // Get userId from request (could be from token, params, or body)
    const userId = req.user?.id || req.params.userId || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        msg: 'User authentication required',
        requiresSubscription: true
      });
    }

    // Check for active subscription
    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: { [Op.gt]: new Date() }
      }
    });

    if (!subscription) {
      return res.status(403).json({
        msg: 'Active subscription required to access this resource',
        requiresSubscription: true,
        hasExpiredSubscription: await checkExpiredSubscription(userId)
      });
    }

    // Add subscription info to request object
    req.subscription = subscription;
    next();

  } catch (error) {
    console.error('Error checking subscription:', error);
    return res.status(500).json({
      msg: 'Error validating subscription',
      error: error.message
    });
  }
};

// Helper function to check if user has expired subscription
const checkExpiredSubscription = async (userId) => {
  try {
    const expiredSubscription = await Subscription.findOne({
      where: {
        userId,
        status: ['expired', 'cancelled'],
        endDate: { [Op.lt]: new Date() }
      }
    });
    return !!expiredSubscription;
  } catch (error) {
    return false;
  }
};

// Middleware for optional subscription check (returns subscription status)
const checkSubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId || req.body.userId;
    
    if (!userId) {
      req.subscriptionStatus = { hasSubscription: false };
      return next();
    }

    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: { [Op.gt]: new Date() }
      }
    });

    req.subscriptionStatus = {
      hasSubscription: !!subscription,
      subscription: subscription || null,
      isExpired: !subscription ? await checkExpiredSubscription(userId) : false
    };

    next();

  } catch (error) {
    console.error('Error checking subscription status:', error);
    req.subscriptionStatus = { hasSubscription: false, error: true };
    next();
  }
};

module.exports = {
  requireActiveSubscription,
  checkSubscriptionStatus
};