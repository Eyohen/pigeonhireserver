// const express = require('express');

// const {create, readall, countCommunity, toggleRestrict, readRestrictedCommunities, readId, update, deleteId, readUserCommunities} = require('../controller/community')

// const router = express.Router();


// router.post(
// 	'/create',
//     create
// );

// router.get(
//     '/',
//     readall
// );
// router.get(
//     '/restricted',
//     readRestrictedCommunities
// );
// router.get(
//     '/count',
//     countCommunity
// );
// router.get(
// 	'/:id',
//     // verifyToken,
//     readId
// );
// router.put(
//     '/:id',
//     // verifyToken,
//     update
// );
// router.put(
//     '/restrict/:id',
//     // verifyToken,
//     toggleRestrict
// );
// router.delete(
//     '/:id',
//     // verifyToken,
//     deleteId
// );
// router.get("/:userId/communities", readUserCommunities); 

// module.exports = router;





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