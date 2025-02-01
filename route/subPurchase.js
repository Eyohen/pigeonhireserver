const express = require('express');

const {create, readall, readId, update, deleteId, readByUserId, getCurrentSubscription, countActiveSubscriptions, countTotalSubscriptions, upgradeSubscription} = require('../controller/subPurchase')
// import verifyToken from '../middleware/verifyToken';
// import { verifyToken, requireAdmin } from '../middleware/authMiddleware'; 
// const multer = require('multer');


const router = express.Router();

// set up multer storage for file uploads
// const storage = multer.memoryStorage();
// const upload = multer({storage});



router.post(
	'/create',
    // verifyToken,
    create
);

router.get(
    '/',
    readall
);

router.get(
    '/active',
    countActiveSubscriptions
);

router.get(
    '/total',
    countTotalSubscriptions
);

router.get(
	'/:id',
    // verifyToken,
    readId
);
router.put(
    '/:id',
    // verifyToken,
    update
);
router.delete(
    '/:id',
    // verifyToken,
    deleteId
);
router.get("/user/:userId", readByUserId); 

router.get("/current-subscription/:id", getCurrentSubscription)

router.patch(
    '/upgrade/:id',
    upgradeSubscription
);


module.exports = router;