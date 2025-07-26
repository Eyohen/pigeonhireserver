// const express = require('express');
// const {
//   getSubscriptionPlans,
//   createPaymentIntent,
//   confirmSubscription,
//   getUserSubscription,
//   cancelSubscription,
//   handleStripeWebhook,
//   getAllSubscriptions
// } = require('../controller/subscription');

// const router = express.Router();

// // Get available subscription plans with pricing
// router.get(
//   '/plans',
//   getSubscriptionPlans
// );

// // Create payment intent for subscription
// router.post(
//   '/create-payment-intent',
//   createPaymentIntent
// );

// // Confirm subscription after successful payment
// router.post(
//   '/confirm',
//   confirmSubscription
// );

// // Get user's subscription details
// router.get(
//   '/user/:userId',
//   getUserSubscription
// );

// // Cancel subscription
// router.put(
//   '/cancel/:subscriptionId',
//   cancelSubscription
// );

// // Stripe webhook endpoint (should be before express.json() middleware)
// router.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   handleStripeWebhook
// );

// // Get all subscriptions (admin endpoint)
// router.get(
//   '/admin/all',
//   // Add admin authentication middleware here
//   getAllSubscriptions
// );

// module.exports = router;




const express = require('express');
const {
  getSubscriptionPlans,
  createSubscription,
  updateSubscriptionStatus,
  getUserSubscription,
  cancelSubscription,
  handleStripeWebhook,
  getAllSubscriptions,
  validateSubscription
} = require('../controller/subscription');

const router = express.Router();

// Get available subscription plans with pricing
router.get(
  '/plans',
  getSubscriptionPlans
);

// Create subscription after successful payment from frontend
router.post(
  '/create',
  createSubscription
);

// Update subscription status (for webhooks or manual updates)
router.put(
  '/update-status/:subscriptionId',
  updateSubscriptionStatus
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

// Stripe webhook endpoint (should be before express.json() middleware)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Get all subscriptions (admin endpoint)
router.get(
  '/admin/all',
  // Add admin authentication middleware here
  getAllSubscriptions
);

module.exports = router;