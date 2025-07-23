// route/analytics.js
const express = require('express');
const {
  getUserAnalytics,
  recordContact,
  recordProfileView,
  createLead,
  updateLead,
  createNetwork,
  updateNetwork,
  getUserContacts,
  getUserLeads,
  getUserNetworks
} = require('../controller/analytics');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Analytics dashboard - get user's overall analytics
router.get(
  '/dashboard/:userId',
  verifyToken,
  getUserAnalytics
);

// Record actions
router.post(
  '/contact',
  verifyToken,
  recordContact
);

router.post(
  '/profile-view',
  verifyToken,
  recordProfileView
);

// Lead management
router.post(
  '/leads',
  verifyToken,
  createLead
);

router.put(
  '/leads/:id',
  verifyToken,
  updateLead
);

router.get(
  '/leads/:userId',
  verifyToken,
  getUserLeads
);

// Network management
router.post(
  '/networks',
  verifyToken,
  createNetwork
);

router.put(
  '/networks/:id',
  verifyToken,
  updateNetwork
);

router.get(
  '/networks/:userId',
  verifyToken,
  getUserNetworks
);

// Get user's activity logs
router.get(
  '/contacts/:userId',
  verifyToken,
  getUserContacts
);

module.exports = router;