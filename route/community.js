// route/community.js
const express = require('express');
const { checkSubscriptionStatus, requireActiveSubscription } = require('../middleware/subscription');
const {
  create,
  readall,
  countCommunity,
  toggleRestrict,
  readRestrictedCommunities,
  readId,
  update,
  deleteId,
  readUserCommunities
} = require('../controller/community');

const router = express.Router();

// Create community (no subscription required)
router.post(
  '/create',
  create
);

// Get all communities (public with limited access for non-subscribers)
router.get(
  '/',
  checkSubscriptionStatus, // Check subscription but don't require it
  readall
);

// Get restricted communities (admin only)
router.get(
  '/restricted',
  readRestrictedCommunities
);

// Count communities (public)
router.get(
  '/count',
  countCommunity
);

// Get community by ID (limited access for non-subscribers)
router.get(
  '/:id',
  checkSubscriptionStatus, // Check subscription but don't require it
  readId
);

// Update community
router.put(
  '/:id',
  // verifyToken, // Add your auth middleware here
  update
);

// Toggle restrict community (admin only)
router.put(
  '/restrict/:id',
  // verifyToken, // Add your auth middleware here
  toggleRestrict
);

// Delete community
router.delete(
  '/:id',
  // verifyToken, // Add your auth middleware here
  deleteId
);

// Get user's communities
router.get(
  "/:userId/communities",
  readUserCommunities
);

module.exports = router;