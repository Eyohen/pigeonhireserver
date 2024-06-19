const express = require('express');
// import TodoValidator from '../validator';
// import Middleware from '../../middleware';
// const {re} = require('../controller/UserController');
const {register, login, adminLogin, refresh} = require('../controller/user');
// import verifyToken from '../middleware/verifyToken';
// import { verifyToken, requireAdmin } from '../middleware/authMiddleware'; 




const router = express.Router();

router.post(
	'/register',
    register	
);
router.post(
    '/login',
    login
);
router.post(
    '/adminlogin',
    adminLogin
);
router.get(
    '/refresh',
    refresh
);


module.exports = router;