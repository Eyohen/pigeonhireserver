//route/user.js
const express = require('express');
const {create,readId, readall,
     countUsers,update, deleteId, 
     readSubscribedUsers,
      updateProfile,
  getProfile,
  uploadProfileImage,
  changePassword
     } = require('../controller/user');
// const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/create',
    create
);

router.get(
    '/',
    readall
);

router.get(
    '/count',
    countUsers
);

router.get(
    '/:id',
    // authMiddleware,
    // verifyToken, requireAdmin,
    readId
);

router.put(
    '/:id',
    update
);

router.delete(
    '/:id',
    deleteId
);

router.get('/subscribed-users/:userId', readSubscribedUsers);

// ========== NEW ENHANCED PROFILE ENDPOINTS ==========

// Enhanced profile management
router.put('/profile/:id', updateProfile); // Enhanced profile update with validation
router.post('/profile/:id/upload-image', uploadProfileImage); // Upload profile image
router.put('/profile/:id/change-password', changePassword); // Change password only

// Get enhanced profile (if you want to use the new getProfile function)
 router.get('/profile/me', getProfile); 

module.exports = router;