//route/currency.js
const express = require('express');

const {create, readall, readId, update, deleteId} = require('../controller/currency')
const {getSubscriptionPlans} = require('../controller/subscription')



const router = express.Router();



router.post(
	'/create',
    // verifyToken,
    create
);

router.get(
    '/',
    getSubscriptionPlans
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

module.exports = router;