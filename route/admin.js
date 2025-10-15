const express = require('express');
const {
    register,
    login,
    adminLogin,
    refresh,
    verifyEmail,
    forgotPassword,
    resetPassword,
    verifyOTP,
    createTeamMember,
    getTeamMembers
} = require('../controller/user');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
	'/register',
    register	
);

router.post(
    '/login',
    adminLogin
);

router.get(
    '/refresh',
    refresh
);
router.post(
    '/forgot-password',
    forgotPassword
);
router.post(
    '/reset-password',
    resetPassword
);

// Team member management routes (Protected)
router.post(
    '/team-members',
    verifyToken,
    requireAdmin,
    createTeamMember
);

router.get(
    '/team-members',
    verifyToken,
    requireAdmin,
    getTeamMembers
);

module.exports = router;