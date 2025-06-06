const express = require('express');

const {create, readall, countPublicOwner, toggleRestrict, readRestrictedCommunities, readId, update, deleteId, readByUserId} = require('../controller/publicOwner')

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
    countPublicOwner
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
router.get("/user/:userId", readByUserId); 

module.exports = router;