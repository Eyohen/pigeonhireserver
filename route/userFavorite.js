// //route/userFavorite.js
// const express = require('express');
// const {
//   addToFavorites,
//   removeFromFavorites,
//   getUserFavorites,
//   checkIsFavorite,
//   getFavoriteCount,
//   getMostFavorited
// } = require('../controller/userFavorite');

// const router = express.Router();

// // Add a community to favorites
// router.post(
//   '/add',
//   addToFavorites
// );

// // Remove a community from favorites
// router.delete(
//   '/remove/:userId/:communityId',
//   removeFromFavorites
// );

// // Get all favorites for a user
// router.get(
//   '/user/:userId',
//   getUserFavorites
// );

// // Check if a community is favorited by a user
// router.get(
//   '/check/:userId/:communityId',
//   checkIsFavorite
// );

// // Get favorite count for a user
// router.get(
//   '/count/:userId',
//   getFavoriteCount
// );

// // Get most favorited communities (trending/analytics)
// router.get(
//   '/trending',
//   getMostFavorited
// );

// module.exports = router;





// route/userFavorite.js - Enhanced to support both communities and connectors
const express = require('express');
const {
  // New enhanced functions
  addToFavorites,
  addCommunityToFavorites,
  addConnectorToFavorites,
  removeCommunityFromFavorites,
  removeConnectorFromFavorites,
  getUserFavorites,
  checkIsCommunityFavorite,
  checkIsConnectorFavorite,
  getFavoriteCount,
  getMostFavoritedCommunities,
  getMostFavoritedConnectors,
  
  // Legacy functions for backward compatibility
  removeFromFavorites,
  checkIsFavorite,
  getMostFavorited
} = require('../controller/userFavorite');

const router = express.Router();

// ========== NEW ENHANCED ENDPOINTS ==========

// Generic add to favorites (handles both communities and connectors)
router.post('/add', addToFavorites);

// Specific endpoints for communities
router.post('/communities/add', addCommunityToFavorites);
router.delete('/communities/:userId/:communityId', removeCommunityFromFavorites);
router.get('/communities/check/:userId/:communityId', checkIsCommunityFavorite);
router.get('/communities/most-favorited', getMostFavoritedCommunities);

// Specific endpoints for connectors
router.post('/connectors/add', addConnectorToFavorites);
router.delete('/connectors/:userId/:connectorId', removeConnectorFromFavorites);
router.get('/connectors/check/:userId/:connectorId', checkIsConnectorFavorite);
router.get('/connectors/most-favorited', getMostFavoritedConnectors);

// User favorites management
router.get('/:userId', getUserFavorites); // Can filter by type using ?type=community or ?type=connector
router.get('/:userId/count', getFavoriteCount); // Can filter by type using ?type=community or ?type=connector

// ========== LEGACY ENDPOINTS (for backward compatibility) ==========

// Legacy community endpoints (maintain backward compatibility)
router.post('/', addCommunityToFavorites); // Legacy: assumes community
router.delete('/:userId/:communityId', removeFromFavorites); // Legacy: assumes community
router.get('/check/:userId/:communityId', checkIsFavorite); // Legacy: assumes community
router.get('/most-favorited', getMostFavorited); // Legacy: assumes community

module.exports = router;