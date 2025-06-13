const express = require('express');
const {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkIsFavorite,
  getFavoriteCount,
  getMostFavorited
} = require('../controller/userFavorite');

const router = express.Router();

// Add a community to favorites
router.post(
  '/add',
  addToFavorites
);

// Remove a community from favorites
router.delete(
  '/remove/:userId/:communityId',
  removeFromFavorites
);

// Get all favorites for a user
router.get(
  '/user/:userId',
  getUserFavorites
);

// Check if a community is favorited by a user
router.get(
  '/check/:userId/:communityId',
  checkIsFavorite
);

// Get favorite count for a user
router.get(
  '/count/:userId',
  getFavoriteCount
);

// Get most favorited communities (trending/analytics)
router.get(
  '/trending',
  getMostFavorited
);

module.exports = router;