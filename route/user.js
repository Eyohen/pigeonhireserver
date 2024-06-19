const express = require('express');
const {readId, readall, update, deleteId} = require('../controller/user');
// const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
    '/',
    readall
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

module.exports = router;