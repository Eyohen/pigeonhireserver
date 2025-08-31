// route/connector.js
const express = require('express');

const {create, readall,
     countConnector, toggleRestrict,
      readRestrictedCommunities, readId, 
      update, deleteId,
    readUserCommunities, adminCreateConnector} = require('../controller/connector')

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
    countConnector
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

router.post('/admin/create', adminCreateConnector);

module.exports = router;