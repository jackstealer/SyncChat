# SyncChat Architecture Documentation

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Layer                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  React UI  │  │  Socket.IO │  │   Axios    │             │
│  │ Components │  │   Client   │  │ HTTP Client│             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      Application Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Express   │  │  Socket.IO │  │    JWT     │             │
│  │   Server   │  │   Server   │  │    Auth    │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                       Data Layer                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  MongoDB   │  │   Redis    │  │    S3      │             │
│  │ (Messages) │  │  (Cache)   │  │  (Files)   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 WebSocket vs HTTP

### HTTP (Request-Response)
- **Nature**: Stateless, client-initiated
- **Use Case**: Authentication, fetching history, user profile
- **Pros**: Simple, cacheable, widely supported
- **Cons**: Polling required for real-time updates, overhead

### WebSocket (Full-Duplex)
- **Nature**: Persistent, bidirectional connection
- **Use Case**: Real-time messaging, presence, typing indicators
- **Pros**: Low latency, efficient, server can push
- **Cons**: More complex, requires connection management

### WebSocket Handshake Process

```
Client                                Server
  │                                     │
  │  HTTP GET /socket.io/?transport=   │
  │  Upgrade: websocket                │
  ├────────────────────────────────────►│
  │                                     │
  │  HTTP 101 Switching Protocols      │
  │◄────────────────────────────────────┤
  │                                     │
  │  WebSocket Connection Established  │
  │◄───────────────────────────────────►│
  │                                     │
  │  emit('authenticate', {token})     │
  ├────────────────────────────────────►│
  │                                     │
  │  emit('authenticated', {user})     │
  │◄────────────────────────────────────┤
  │                                     │
```

## 📨 Message Flow Architecture

### Sending a Message

```
┌─────────┐         ┌─────────┐         ┌──────────┐         ┌─────────┐
│ User A  │         │ Client  │         │  Server  │         │ User B  │
└────┬────┘         └────┬────┘         └────┬─────┘         └────┬────┘
     │                   │                   │                    │
     │ Type message      │                   │                    │
     ├──────────────────►│                   │                    │
     │                   │                   │                    │
     │                   │ emit('send_msg')  │                    │
     │                   ├──────────────────►│                    │
     │                   │                   │                    │
     │                   │                   │ Validate           │
     │                   │                   │ Store in DB        │
     │                   │                   │                    │
     │                   │ emit('msg_sent')  │                    │
     │                   │◄──────────────────┤                    │
     │                   │                   │                    │
     │ Update UI         │                   │ emit('receive_msg')│
     │◄──────────────────┤                   ├───────────────────►│
     │                   │                   │                    │
     │                   │                   │                    │ Update UI
     │                   │                   │                    │◄──────────
```

## 🔐 Authentication Flow

### Registration & Login

```
1. User submits credentials
   ↓
2. Server validates input
   ↓
3. Password hashed with bcrypt
   ↓
4. User stored in MongoDB
   ↓
5. JWT token generated
   ↓
6. Token sent to client
   ↓
7. Client stores in localStorage
   ↓
8. Token included in subsequent requests
```

### WebSocket Authentication

```javascript
// Client connects with token
socket.auth = { token: localStorage.getItem('token') };

// Server middleware validates
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.userId;
    next();
  });
});
```

## 💾 Database Schema Design

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed),
  avatar: String,
  status: String (online/offline),
  lastSeen: Date,
  createdAt: Date
}
```

### Conversation Model
```javascript
{
  _id: ObjectId,
  participants: [ObjectId] (indexed),
  type: String (private/group),
  lastMessage: ObjectId,
  updatedAt: Date,
  createdAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId (indexed),
  sender: ObjectId (indexed),
  content: String,
  type: String (text/image/file),
  status: String (sent/delivered/read),
  readBy: [ObjectId],
  edited: Boolean,
  deleted: Boolean,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## 🔄 State Synchronization

### Initial Load
1. User authenticates
2. Fetch conversations list (REST API)
3. Fetch recent messages for each conversation
4. Establish WebSocket connection
5. Subscribe to relevant rooms

### Reconnection Strategy
```javascript
socket.on('disconnect', () => {
  // Attempt reconnection with exponential backoff
  setTimeout(() => socket.connect(), 1000);
});

socket.on('connect', () => {
  // Fetch missed messages
  const lastMessageTime = getLastMessageTime();
  fetchMessagesSince(lastMessageTime);
});
```

## 👥 Concurrent User Handling

### Connection Management
```javascript
// Track active connections
const activeUsers = new Map();

socket.on('connection', (socket) => {
  activeUsers.set(socket.userId, socket.id);
  
  socket.on('disconnect', () => {
    activeUsers.delete(socket.userId);
  });
});
```

### Room-Based Communication
```javascript
// Users join conversation rooms
socket.join(`conversation:${conversationId}`);

// Broadcast to room
io.to(`conversation:${conversationId}`).emit('receive_message', message);
```

## 📈 Scalability Architecture

### Single Server (Current)
```
┌─────────┐
│ Client  │──┐
└─────────┘  │
             ├──► ┌──────────┐     ┌──────────┐
┌─────────┐  │    │ Node.js  │────►│ MongoDB  │
│ Client  │──┤    │ Socket.IO│     └──────────┘
└─────────┘  │    └──────────┘
             │
┌─────────┐  │
│ Client  │──┘
└─────────┘
```

### Multi-Server with Redis (Scaled)
```
┌─────────┐                    ┌──────────┐
│ Client  │──┐                 │  Redis   │
└─────────┘  │                 │ Pub/Sub  │
             │                 └────┬─────┘
┌─────────┐  │    ┌──────────┐     │
│ Client  │──┼───►│  Server  │─────┤
└─────────┘  │    │    1     │     │
             │    └──────────┘     │
┌─────────┐  │                     │     ┌──────────┐
│ Client  │──┤    ┌──────────┐     │     │ MongoDB  │
└─────────┘  │    │  Server  │─────┼────►│ Cluster  │
             ├───►│    2     │     │     └──────────┘
┌─────────┐  │    └──────────┘     │
│ Client  │──┤                     │
└─────────┘  │    ┌──────────┐     │
             │    │  Server  │─────┤
┌─────────┐  │    │    3     │     │
│ Client  │──┘    └──────────┘     │
└─────────┘                        │
```

### Redis Adapter Implementation
```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Load Balancing Strategy
- Use sticky sessions (IP-based or cookie-based)
- Ensures client reconnects to same server
- Redis syncs state across servers

## 🎯 Microservices Architecture (Future)

```
┌──────────────┐
│   API        │
│   Gateway    │
└──────┬───────┘
       │
       ├──────► ┌──────────────┐
       │        │ Auth Service │
       │        └──────────────┘
       │
       ├──────► ┌──────────────┐     ┌──────────┐
       │        │   Message    │────►│ RabbitMQ │
       │        │   Service    │     └──────────┘
       │        └──────────────┘
       │
       ├──────► ┌──────────────┐
       │        │  Presence    │
       │        │   Service    │
       │        └──────────────┘
       │
       └──────► ┌──────────────┐
                │ Notification │
                │   Service    │
                └──────────────┘
```

## 🔍 Performance Optimizations

1. **Database Indexing**
   - Index on conversationId, sender, createdAt
   - Compound indexes for common queries

2. **Message Pagination**
   - Load 50 messages at a time
   - Infinite scroll for history

3. **Caching Strategy**
   - Redis for user presence
   - Cache conversation lists
   - Cache user profiles

4. **Connection Pooling**
   - MongoDB connection pool
   - Redis connection pool

5. **Compression**
   - Enable Socket.IO compression
   - Gzip HTTP responses

## 🛡️ Security Considerations

1. **Authentication**: JWT with short expiry + refresh tokens
2. **Authorization**: Verify user access to conversations
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent spam and abuse
5. **CORS**: Whitelist allowed origins
6. **XSS Protection**: Escape message content
7. **SQL Injection**: Use parameterized queries (Mongoose)
8. **DDoS Protection**: Implement rate limiting and throttling
