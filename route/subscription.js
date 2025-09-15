//route/subscription.js

const express = require('express');
const {
  getSubscriptionPlans,
  getUserSubscription,
  cancelSubscription,
  handleStripeWebhook,
  getAllSubscriptions,
  validateSubscription
} = require('../controller/subscription');

const router = express.Router();

// IMPORTANT: Remove express.raw() from here since it's handled in index.js
// Stripe webhook endpoint (raw body parsing handled in index.js)
router.post(
  '/webhook',
  // Remove this line: express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Get available subscription plans with pricing
router.get(
  '/plans',
  getSubscriptionPlans
);

// Get user's subscription details
router.get(
  '/user/:userId',
  getUserSubscription
);

// Validate if user has active subscription
router.get(
  '/validate/:userId',
  validateSubscription
);

// Cancel subscription
router.put(
  '/cancel/:subscriptionId',
  cancelSubscription
);

// Get all subscriptions (admin endpoint)
router.get(
  '/admin/all',
  // Add admin authentication middleware here if needed
  getAllSubscriptions
);

module.exports = router;