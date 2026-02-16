const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(apiLimiter);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversation)
  .delete(deleteConversation);

module.exports = router;
