// routes/communityReview.js
const express = require('express');
const router = express.Router();
const communityReviewController = require('../controller/communityReview');
// const authMiddleware = require('../middleware/auth'); // If you have auth middleware

// Public routes - no auth required
router.get('/communities/:communityId/reviews', communityReviewController.getCommunityReviews);
router.get('/community-reviews/:id', communityReviewController.getReviewById);

// Routes that can work with either auth or reviewerId in body
router.post('/communities/:communityId/reviews', communityReviewController.createCommunityReview);
router.get('/communities/:communityId/user-review', communityReviewController.getUserCommunityReview);
router.put('/community-reviews/:id', communityReviewController.updateReview);
router.delete('/community-reviews/:id', communityReviewController.deleteReview);

module.exports = router;