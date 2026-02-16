# SyncChat - Real-Time Messaging Platform

A production-ready real-time chat application built with React, Node.js, Socket.IO, and MongoDB. Features instant messaging, online presence, typing indicators, and more.

## 🚀 Features

### Core Features
- ✅ User Registration & Authentication (JWT)
- ✅ Real-time messaging with Socket.IO
- ✅ Online/Offline status tracking
- ✅ Private one-on-one chats
- ✅ Persistent chat history
- ✅ Message timestamps
- ✅ Concurrent user support

### Advanced Features
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Message editing & deletion
- ✅ Online presence indicators
- ✅ Message pagination
- ✅ Dark mode
- ✅ Responsive design
- ✅ Reconnection handling
- ✅ File sharing (images)

## 🏗️ Architecture

```
┌─────────────┐         WebSocket          ┌─────────────┐
│   React     │◄──────────────────────────►│  Socket.IO  │
│   Client    │         REST API           │   Server    │
└─────────────┘◄──────────────────────────►└─────────────┘
                                                    │
                                                    ▼
                                            ┌─────────────┐
                                            │  MongoDB    │
                                            └─────────────┘
```

### How It Works

1. **WebSocket Handshake**: Client establishes persistent connection via Socket.IO
2. **Authentication**: JWT tokens validate users on both HTTP and WebSocket layers
3. **Message Flow**: 
   - User sends message → Socket.IO emits event
   - Server receives → Validates → Stores in DB
   - Server broadcasts to recipient(s)
   - UI updates in real-time
4. **State Sync**: On reconnection, client fetches missed messages via REST API

## 📦 Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Axios (HTTP client)
- Socket.IO Client
- React Router
- Context API (State management)

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- Bcrypt (Password hashing)
- Mongoose (MongoDB ODM)

### Database
- MongoDB Atlas

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- XSS protection
- Secure HTTP headers

## 📡 WebSocket Events

### Client → Server
- `join_room` - Join a conversation room
- `send_message` - Send a message
- `typing` - Notify typing status
- `mark_read` - Mark messages as read
- `edit_message` - Edit existing message
- `delete_message` - Delete a message

### Server → Client
- `receive_message` - Receive new message
- `user_online` - User came online
- `user_offline` - User went offline
- `typing_status` - Someone is typing
- `message_edited` - Message was edited
- `message_deleted` - Message was deleted
- `message_read` - Message was read

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Scalability Considerations

### Current Architecture
- Single server instance
- Direct Socket.IO connections
- MongoDB for persistence

### Scaling to Production

1. **Horizontal Scaling**
   - Use Redis adapter for Socket.IO
   - Enable sticky sessions on load balancer
   - Multiple server instances

2. **Database Optimization**
   - Implement database indexing
   - Use read replicas
   - Cache frequently accessed data

3. **Message Queue**
   - Integrate RabbitMQ/Kafka for async processing
   - Decouple message delivery from storage

4. **Microservices**
   - Auth service
   - Message service
   - Presence service
   - Notification service

### Redis Pub/Sub Integration

```javascript
// For multi-server deployment
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ 
  host: 'localhost', 
  port: 6379 
}));
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render/Railway)
```bash
cd backend
# Push to GitHub
# Connect repository to Render/Railway
# Set environment variables
# Deploy
```

### Database (MongoDB Atlas)
- Create cluster on MongoDB Atlas
- Whitelist IP addresses
- Get connection string
- Update .env

## 📁 Project Structure

```
SyncChat/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── utils/
│   ├── tests/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── utils/
└── docs/
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 👨‍💻 Author

Built with ❤️ for learning and demonstration purposes
