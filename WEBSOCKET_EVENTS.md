# WebSocket Events Documentation

## Event Flow Overview

This document explains all WebSocket events, their payloads, and how they work together to create real-time communication.

## Connection Events

### `connection`
**Direction**: Server receives
**When**: Client establishes WebSocket connection
**Payload**: None (handled by Socket.IO)

**Server Handler**:
```javascript
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.userId}`);
  // Update user status to online
  // Join user's rooms
  // Broadcast online status
});
```

**Client Usage**:
```javascript
const socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('token') }
});
```

### `disconnect`
**Direction**: Server receives
**When**: Client disconnects (logout, close tab, network loss)
**Payload**: None

**Server Handler**:
```javascript
socket.on('disconnect', async () => {
  // Update user status to offline
  // Broadcast offline status
  // Clean up resources
});
```

## Authentication Events

### `authenticate` (Middleware)
**Direction**: Client → Server
**When**: During connection handshake
**Payload**:
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Server Middleware**:
```javascript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, JWT_SECRET);
  socket.userId = decoded.id;
  next();
});
```

## Room Management Events

### `join_conversations`
**Direction**: Client → Server
**When**: After connection, to join all conversation rooms
**Payload**:
```javascript
["conv_id_1", "conv_id_2", "conv_id_3"]
```

**Server Handler**:
```javascript
socket.on('join_conversations', (conversationIds) => {
  conversationIds.forEach(id => {
    socket.join(`conversation:${id}`);
  });
});
```

**Client Usage**:
```javascript
useEffect(() => {
  if (socket && connected) {
    const conversationIds = conversations.map(c => c._id);
    socket.emit('join_conversations', conversationIds);
  }
}, [socket, connected, conversations]);
```

## Messaging Events

### `send_message`
**Direction**: Client → Server
**When**: User sends a message
**Payload**:
```javascript
{
  conversationId: "conv_123",
  content: "Hello, how are you?",
  type: "text",  // or "image", "file"
  fileUrl: "https://...",  // optional
  fileName: "image.jpg"    // optional
}
```

**Callback Response**:
```javascript
{
  success: true,
  message: {
    _id: "msg_123",
    conversationId: "conv_123",
    sender: {
      _id: "user_123",
      username: "alice",
      avatar: "https://..."
    },
    content: "Hello, how are you?",
    type: "text",
    status: "sent",
    createdAt: "2024-01-15T10:30:00.000Z"
  }
}
```

**Server Handler**:
```javascript
socket.on('send_message', async (data, callback) => {
  // Validate conversation access
  // Create message in database
  // Broadcast to conversation room
  // Send confirmation callback
  
  io.to(`conversation:${conversationId}`).emit('receive_message', {
    message,
    conversationId
  });
  
  callback({ success: true, message });
});
```

**Client Usage**:
```javascript
const handleSendMessage = () => {
  socket.emit('send_message', {
    conversationId: conversation._id,
    content: messageText,
    type: 'text'
  }, (response) => {
    if (response.success) {
      setMessages(prev => [...prev, response.message]);
    }
  });
};
```

### `receive_message`
**Direction**: Server → Client
**When**: Another user sends a message in the conversation
**Payload**:
```javascript
{
  message: {
    _id: "msg_123",
    conversationId: "conv_123",
    sender: {
      _id: "user_456",
      username: "bob",
      avatar: "https://..."
    },
    content: "I'm doing great!",
    type: "text",
    status: "sent",
    createdAt: "2024-01-15T10:31:00.000Z"
  },
  conversationId: "conv_123"
}
```

**Client Handler**:
```javascript
socket.on('receive_message', ({ message, conversationId }) => {
  if (conversationId === currentConversation._id) {
    setMessages(prev => [...prev, message]);
    // Mark as read if conversation is open
    markAsRead(message._id);
  }
  // Update conversation list
  updateConversationLastMessage(conversationId, message);
});
```

## Typing Indicator Events

### `typing`
**Direction**: Client → Server
**When**: User starts/stops typing
**Payload**:
```javascript
{
  conversationId: "conv_123",
  isTyping: true  // or false
}
```

**Server Handler**:
```javascript
socket.on('typing', ({ conversationId, isTyping }) => {
  socket.to(`conversation:${conversationId}`).emit('typing_status', {
    userId: socket.userId,
    username: socket.username,
    conversationId,
    isTyping
  });
});
```

**Client Usage**:
```javascript
const handleTyping = (e) => {
  setMessage(e.target.value);
  
  // Clear existing timeout
  if (typingTimeout) clearTimeout(typingTimeout);
  
  // Emit typing start
  socket.emit('typing', {
    conversationId: conversation._id,
    isTyping: true
  });
  
  // Set timeout to emit typing stop
  const timeout = setTimeout(() => {
    socket.emit('typing', {
      conversationId: conversation._id,
      isTyping: false
    });
  }, 2000);
  
  setTypingTimeout(timeout);
};
```

### `typing_status`
**Direction**: Server → Client
**When**: Another user starts/stops typing
**Payload**:
```javascript
{
  userId: "user_456",
  username: "bob",
  conversationId: "conv_123",
  isTyping: true
}
```

**Client Handler**:
```javascript
socket.on('typing_status', ({ userId, username, conversationId, isTyping }) => {
  if (conversationId === currentConversation._id) {
    if (isTyping) {
      setTypingUsers(prev => new Set([...prev, username]));
    } else {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    }
  }
});
```

## Read Receipt Events

### `mark_read`
**Direction**: Client → Server
**When**: User opens conversation or receives message while conversation is open
**Payload**:
```javascript
{
  conversationId: "conv_123",
  messageIds: ["msg_1", "msg_2", "msg_3"]
}
```

**Server Handler**:
```javascript
socket.on('mark_read', async ({ conversationId, messageIds }) => {
  // Update messages in database
  await Message.updateMany(
    { _id: { $in: messageIds } },
    { 
      $addToSet: { readBy: { user: socket.userId, readAt: new Date() } },
      status: 'read'
    }
  );
  
  // Notify other participants
  io.to(`conversation:${conversationId}`).emit('messages_read', {
    conversationId,
    messageIds,
    readBy: socket.userId
  });
});
```

**Client Usage**:
```javascript
useEffect(() => {
  if (messages.length > 0) {
    const unreadIds = messages
      .filter(m => m.sender._id !== user._id && m.status !== 'read')
      .map(m => m._id);
    
    if (unreadIds.length > 0) {
      socket.emit('mark_read', {
        conversationId: conversation._id,
        messageIds: unreadIds
      });
    }
  }
}, [messages]);
```

### `messages_read`
**Direction**: Server → Client
**When**: Another user reads your messages
**Payload**:
```javascript
{
  conversationId: "conv_123",
  messageIds: ["msg_1", "msg_2"],
  readBy: "user_456"
}
```

**Client Handler**:
```javascript
socket.on('messages_read', ({ conversationId, messageIds, readBy }) => {
  if (conversationId === currentConversation._id) {
    setMessages(prev =>
      prev.map(msg =>
        messageIds.includes(msg._id)
          ? { ...msg, status: 'read' }
          : msg
      )
    );
  }
});
```

## Message Editing Events

### `edit_message`
**Direction**: Client → Server
**When**: User edits their own message
**Payload**:
```javascript
{
  messageId: "msg_123",
  newContent: "Updated message content"
}
```

**Callback Response**:
```javascript
{
  success: true
}
```

**Server Handler**:
```javascript
socket.on('edit_message', async ({ messageId, newContent }, callback) => {
  // Verify ownership
  const message = await Message.findOne({
    _id: messageId,
    sender: socket.userId
  });
  
  if (!message) {
    return callback({ success: false, message: 'Unauthorized' });
  }
  
  // Update message
  message.content = newContent;
  message.edited = true;
  message.editedAt = new Date();
  await message.save();
  
  // Broadcast edit
  io.to(`conversation:${message.conversationId}`).emit('message_edited', {
    messageId,
    newContent,
    editedAt: message.editedAt,
    conversationId: message.conversationId
  });
  
  callback({ success: true });
});
```

### `message_edited`
**Direction**: Server → Client
**When**: A message is edited
**Payload**:
```javascript
{
  messageId: "msg_123",
  newContent: "Updated message content",
  editedAt: "2024-01-15T10:35:00.000Z",
  conversationId: "conv_123"
}
```

**Client Handler**:
```javascript
socket.on('message_edited', ({ messageId, newContent, editedAt, conversationId }) => {
  if (conversationId === currentConversation._id) {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId
          ? { ...msg, content: newContent, edited: true, editedAt }
          : msg
      )
    );
  }
});
```

## Message Deletion Events

### `delete_message`
**Direction**: Client → Server
**When**: User deletes their own message
**Payload**:
```javascript
{
  messageId: "msg_123"
}
```

**Server Handler**:
```javascript
socket.on('delete_message', async ({ messageId }, callback) => {
  // Verify ownership
  // Soft delete message
  message.deleted = true;
  message.deletedAt = new Date();
  message.content = 'This message was deleted';
  await message.save();
  
  // Broadcast deletion
  io.to(`conversation:${message.conversationId}`).emit('message_deleted', {
    messageId,
    conversationId: message.conversationId
  });
  
  callback({ success: true });
});
```

### `message_deleted`
**Direction**: Server → Client
**When**: A message is deleted
**Payload**:
```javascript
{
  messageId: "msg_123",
  conversationId: "conv_123"
}
```

**Client Handler**:
```javascript
socket.on('message_deleted', ({ messageId, conversationId }) => {
  if (conversationId === currentConversation._id) {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId
          ? { ...msg, deleted: true, content: 'This message was deleted' }
          : msg
      )
    );
  }
});
```

## Presence Events

### `user_online`
**Direction**: Server → Client
**When**: A user connects
**Payload**:
```javascript
{
  userId: "user_456",
  username: "bob"
}
```

**Client Handler**:
```javascript
socket.on('user_online', ({ userId, username }) => {
  setOnlineUsers(prev => new Set([...prev, userId]));
  toast.info(`${username} is online`);
});
```

### `user_offline`
**Direction**: Server → Client
**When**: A user disconnects
**Payload**:
```javascript
{
  userId: "user_456",
  username: "bob",
  lastSeen: "2024-01-15T10:40:00.000Z"
}
```

**Client Handler**:
```javascript
socket.on('user_offline', ({ userId, username, lastSeen }) => {
  setOnlineUsers(prev => {
    const newSet = new Set(prev);
    newSet.delete(userId);
    return newSet;
  });
  toast.info(`${username} went offline`);
});
```

## Error Handling

### Connection Errors

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  toast.error('Failed to connect to server');
});
```

### Authentication Errors

```javascript
socket.on('error', (error) => {
  if (error.message.includes('Authentication')) {
    // Redirect to login
    logout();
  }
});
```

## Event Flow Diagrams

### Sending a Message

```
Client A                    Server                    Client B
   │                          │                          │
   │  emit('send_message')    │                          │
   ├─────────────────────────►│                          │
   │                          │                          │
   │                          │  Save to DB              │
   │                          │  ─────────►              │
   │                          │                          │
   │  callback({success})     │                          │
   │◄─────────────────────────┤                          │
   │                          │                          │
   │                          │  emit('receive_message') │
   │                          ├─────────────────────────►│
   │                          │                          │
   │                          │  emit('receive_message') │
   │◄─────────────────────────┤                          │
```

### Typing Indicator

```
Client A                    Server                    Client B
   │                          │                          │
   │  emit('typing', true)    │                          │
   ├─────────────────────────►│                          │
   │                          │                          │
   │                          │  emit('typing_status')   │
   │                          ├─────────────────────────►│
   │                          │                          │
   │  (2 seconds pass)        │                          │
   │                          │                          │
   │  emit('typing', false)   │                          │
   ├─────────────────────────►│                          │
   │                          │                          │
   │                          │  emit('typing_status')   │
   │                          ├─────────────────────────►│
```

### Read Receipts

```
Client A                    Server                    Client B
   │                          │                          │
   │  (sends message)         │                          │
   │                          │  emit('receive_message') │
   │                          ├─────────────────────────►│
   │                          │                          │
   │                          │  emit('mark_read')       │
   │                          │◄─────────────────────────┤
   │                          │                          │
   │                          │  Update DB               │
   │                          │  ─────────►              │
   │                          │                          │
   │  emit('messages_read')   │                          │
   │◄─────────────────────────┤                          │
   │                          │                          │
   │  (shows double check)    │                          │
```

## Best Practices

1. **Always use callbacks** for critical operations (send_message)
2. **Implement timeouts** for typing indicators
3. **Debounce** typing events to reduce server load
4. **Validate** all data on server side
5. **Handle disconnections** gracefully with reconnection logic
6. **Use rooms** for efficient message broadcasting
7. **Acknowledge** received events when necessary
8. **Clean up** event listeners on component unmount

## Performance Considerations

- **Batch operations**: Group multiple mark_read calls
- **Throttle typing**: Don't emit on every keystroke
- **Limit payload size**: Keep messages under 5KB
- **Use binary data**: For file transfers, use binary protocols
- **Compress data**: Enable Socket.IO compression
- **Connection pooling**: Reuse connections when possible
