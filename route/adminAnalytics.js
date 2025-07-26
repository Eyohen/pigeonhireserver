// route/adminAnalytics.js
const express = require('express');
const {
  getAdminAnalytics,
  getTopCommunities,
  getSubscriptionTrends,
  getUserActivity
} = require('../controller/adminAnalytics');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Get overall admin analytics dashboard
router.get(
  '/dashboard',
  verifyToken, // Add admin verification middleware here if needed
  getAdminAnalytics
);

// Get top communities by various metrics
router.get(
  '/top-communities',
  verifyToken,
  getTopCommunities
);

// Get subscription trends over time
router.get(
  '/subscription-trends',
  verifyToken,
  getSubscriptionTrends
);

// Get user activity metrics
router.get(
  '/user-activity',
  verifyToken,
  getUserActivity
);

module.exports = router;