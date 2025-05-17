// routes/connectorReview.js
const express = require('express');
const router = express.Router();
const connectorReviewController = require('../controller/connectorreview');
// const authMiddleware = require('../middleware/auth'); // If you have auth middleware

// Public routes - no auth required
router.get('/connectors/:connectorId/reviews', connectorReviewController.getConnectorReviews);
router.get('/connector-reviews/:id', connectorReviewController.getReviewById);

// Routes that can work with either auth or reviewerId in body
router.post('/connectors/:connectorId/reviews', connectorReviewController.createConnectorReview);
router.get('/connectors/:connectorId/user-review', connectorReviewController.getUserConnectorReview);
router.put('/connector-reviews/:id', connectorReviewController.updateReview);
router.delete('/connector-reviews/:id', connectorReviewController.deleteReview);

module.exports = router;