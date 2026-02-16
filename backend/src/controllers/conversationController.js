const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username avatar status lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// @desc    Get single conversation
// @route   GET /api/conversations/:id
// @access  Private
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    })
      .populate('participants', 'username avatar status lastSeen');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { participantId, type = 'private' } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      type: 'private',
      participants: {
        $all: [req.user._id, participantId],
        $size: 2
      }
    })
      .populate('participants', 'username avatar status lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      });

    if (existingConversation) {
      return res.json({
        success: true,
        conversation: existingConversation,
        existed: true
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      type
    });

    await conversation.populate('participants', 'username avatar status lastSeen');

    res.status(201).json({
      success: true,
      conversation,
      existed: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId: conversation._id });

    // Delete conversation
    await conversation.deleteOne();

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation
};
