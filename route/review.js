const express = require('express');
const router = express.Router();
const review = require('../controller/review');
// const authMiddleware = require('../middleware/auth');

// Community review routes
router.post('/communities/:communityId/reviews', review.createCommunityReview);
router.get('/communities/:communityId/reviews', review.getCommunityReviews);
router.get('/communities/:communityId/my-review', review.getUserCommunityReview);

// General review routes
router.get('/reviews/:id', review.getReviewById);
router.put('/reviews/:id', review.updateReview);
router.delete('/reviews/:id', review.deleteReview);

module.exports = router;