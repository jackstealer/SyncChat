const express = require('express');
const router = express.Router();
const { getUsers, searchUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(apiLimiter);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.put('/profile', updateProfile);

module.exports = router;
