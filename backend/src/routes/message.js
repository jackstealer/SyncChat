const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiter');
const { messageValidation } = require('../middleware/validation');

router.use(protect);

router.get('/:conversationId', getMessages);
router.post('/:conversationId', messageLimiter, messageValidation, sendMessage);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);

module.exports = router;
