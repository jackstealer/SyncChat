const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or unauthorized'
      });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversationId,
      deleted: false
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Message.countDocuments({
      conversationId,
      deleted: false
    });

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/messages/:conversationId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', fileUrl, fileName } = req.body;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or unauthorized'
      });
    }

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content,
      type,
      fileUrl,
      fileName
    });

    await message.populate('sender', 'username avatar');

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation:${conversationId}`).emit('receive_message', {
        message: message.toObject(),
        conversationId
      });
    }

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:messageId
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation:${message.conversationId}`).emit('message_edited', {
        messageId,
        newContent: content,
        editedAt: message.editedAt,
        conversationId: message.conversationId
      });
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    // Emit via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation:${message.conversationId}`).emit('message_deleted', {
        messageId,
        conversationId: message.conversationId
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage
};
