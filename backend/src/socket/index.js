const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Store active users: userId -> socketId
const activeUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    },
    pingTimeout: 60000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.userId})`);

    // Store active user
    activeUsers.set(socket.userId, socket.id);

    // Update user status to online
    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      socketId: socket.id
    });

    // Notify all users about online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.username
    });

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join conversation rooms
    socket.on('join_conversations', async (conversationIds) => {
      conversationIds.forEach(id => {
        socket.join(`conversation:${id}`);
      });
      console.log(`📥 ${socket.username} joined ${conversationIds.length} conversations`);
    });

    // Handle sending messages
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content, type = 'text', fileUrl, fileName } = data;

        // Validate conversation access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) {
          return callback({ success: false, message: 'Unauthorized' });
        }

        // Create message
        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          content,
          type,
          fileUrl,
          fileName,
          status: 'sent'
        });

        // Populate sender info
        await message.populate('sender', 'username avatar');

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        // Emit to all users in the conversation
        io.to(`conversation:${conversationId}`).emit('receive_message', {
          message: message.toObject(),
          conversationId
        });

        // Send delivery confirmation
        callback({ success: true, message: message.toObject() });

        console.log(`💬 Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ success: false, message: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_status', {
        userId: socket.userId,
        username: socket.username,
        conversationId,
        isTyping
      });
    });

    // Handle mark as read
    socket.on('mark_read', async ({ conversationId, messageIds }) => {
      try {
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            conversationId,
            sender: { $ne: socket.userId }
          },
          {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            },
            status: 'read'
          }
        );

        // Notify sender that messages were read
        io.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          messageIds,
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle message editing
    socket.on('edit_message', async ({ messageId, newContent }, callback) => {
      try {
        const message = await Message.findOne({
          _id: messageId,
          sender: socket.userId
        });

        if (!message) {
          return callback({ success: false, message: 'Message not found or unauthorized' });
        }

        message.content = newContent;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        io.to(`conversation:${message.conversationId}`).emit('message_edited', {
          messageId,
          newContent,
          editedAt: message.editedAt,
          conversationId: message.conversationId
        });

        callback({ success: true });
      } catch (error) {
        callback({ success: false, message: error.message });
      }
    });

    // Handle message deletion
    socket.on('delete_message', async ({ messageId }, callback) => {
      try {
        const message = await Message.findOne({
          _id: messageId,
          sender: socket.userId
        });

        if (!message) {
          return callback({ success: false, message: 'Message not found or unauthorized' });
        }

        message.deleted = true;
        message.deletedAt = new Date();
        message.content = 'This message was deleted';
        await message.save();

        io.to(`conversation:${message.conversationId}`).emit('message_deleted', {
          messageId,
          conversationId: message.conversationId
        });

        callback({ success: true });
      } catch (error) {
        callback({ success: false, message: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.username}`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Update user status to offline
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: new Date(),
        socketId: null
      });

      // Notify all users about offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.username,
        lastSeen: new Date()
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = { initializeSocket, activeUsers };
