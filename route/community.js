const express = require('express');

const {create, readall, countCommunity, toggleRestrict, readRestrictedCommunities, readId, update, deleteId, readUserCommunities} = require('../controller/community')

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
    '/restricted',
    readRestrictedCommunities
);
router.get(
    '/count',
    countCommunity
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
router.put(
    '/restrict/:id',
    // verifyToken,
    toggleRestrict
);
router.delete(
    '/:id',
    // verifyToken,
    deleteId
);
router.get("/:userId/communities", readUserCommunities); 

module.exports = router;