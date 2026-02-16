# 💬 SyncChat - Real-Time Messaging Platform

<div align="center">

![SyncChat Banner](https://img.shields.io/badge/SyncChat-Real--Time%20Messaging-0ea5e9?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**A production-ready, full-stack real-time chat application built with modern web technologies**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 🌟 Overview

SyncChat is a **production-ready real-time messaging platform** similar to WhatsApp or Discord. It demonstrates enterprise-level architecture, real-time communication with WebSockets, and modern full-stack development practices.

### ✨ Key Highlights

- 🚀 **Real-time messaging** with Socket.IO
- 🔐 **Secure authentication** with JWT
- 💬 **Instant delivery** of messages
- 👥 **Online presence** tracking
- ⌨️ **Typing indicators** in real-time
- ✅ **Read receipts** (delivered/read status)
- 🌙 **Dark mode** support
- 📱 **Responsive design** (mobile/tablet/desktop)
- 🔄 **Auto-reconnection** handling
- 📊 **Scalable architecture** (1K to 100K+ users)

---

## 🎯 Features

### Core Features
- ✅ User registration & authentication (JWT)
- ✅ Real-time bidirectional messaging
- ✅ Online/offline status tracking
- ✅ Private one-on-one conversations
- ✅ Persistent message history
- ✅ Message timestamps
- ✅ Concurrent user support

### Advanced Features
- ✅ Typing indicators with animation
- ✅ Read receipts (sent/delivered/read)
- ✅ Message editing & deletion
- ✅ Online presence indicators (green dot)
- ✅ Message pagination (50 per page)
- ✅ Dark mode with persistence
- ✅ User search functionality
- ✅ Automatic reconnection
- ✅ Toast notifications

### Security Features
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (client & server)
- ✅ Rate limiting (API & messages)
- ✅ CORS configuration
- ✅ XSS protection
- ✅ Secure HTTP headers

---

## 🎬 Demo

### Screenshots

**Login Page**
```
Beautiful gradient background with modern UI
```

**Chat Interface**
```
- Sidebar with conversation list
- Real-time message window
- Typing indicators
- Online status indicators
```

**Dark Mode**
```
Seamless dark mode toggle with persistence
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jackstealer/syncchat.git
cd syncchat
```

2. **Automated Setup (Recommended)**
```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh && ./setup.sh
```

3. **Manual Setup**

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start
```

4. **Configure Environment**

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/syncchat
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:3000
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

5. **Access the Application**
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## 📚 Documentation

Comprehensive documentation is available:

- 📖 [Quick Start Guide](QUICKSTART.md) - Get running in 5 minutes
- 🏗️ [Architecture](ARCHITECTURE.md) - System design & WebSocket flow
- 🚀 [Deployment Guide](DEPLOYMENT.md) - Deploy to production
- 🧪 [Testing Guide](TESTING.md) - Testing strategies
- 📈 [Scalability](SCALABILITY.md) - Scale to 100K+ users
- 🔌 [WebSocket Events](WEBSOCKET_EVENTS.md) - All events documented
- ⚙️ [Installation](INSTALLATION.md) - Detailed setup & troubleshooting

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **React Router** - Routing
- **Context API** - State management
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Socket.IO** - WebSocket server
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers

### DevOps
- **Vercel** - Frontend hosting
- **Render/Railway** - Backend hosting
- **MongoDB Atlas** - Database hosting
- **Git** - Version control

---

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

### Message Flow
1. User sends message → Socket.IO emits event
2. Server validates → Stores in MongoDB
3. Server broadcasts to recipient(s)
4. UI updates in real-time
5. Read receipts sent back

---

## 📊 Project Structure

```
syncchat/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── socket/         # WebSocket handlers
│   └── server.js           # Entry point
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # State management
│   │   ├── pages/         # Page components
│   │   └── App.js         # Root component
│   └── public/
│
└── docs/                  # Documentation
    ├── README.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── ... (10+ guides)
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Load testing
artillery run load-test.yml
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render/Railway)
1. Push to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster
2. Get connection string
3. Update backend .env

**Detailed guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📈 Scalability

### Current Architecture (1-1K users)
- Single server
- Direct Socket.IO connections

### Phase 2 (1K-10K users)
- Multiple servers with Redis Pub/Sub
- Load balancer with sticky sessions

### Phase 3 (10K-100K users)
- Microservices architecture
- Message queue (RabbitMQ)
- MongoDB sharding

**Full guide:** [SCALABILITY.md](SCALABILITY.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Atul Raj Gautam**

- GitHub: [@jackstealer](https://github.com/jackstealer)
- Email: jackstealer.hc@gmail.com

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by WhatsApp and Discord
- Created for learning and demonstration purposes

---

## 📞 Support

- 📖 Documentation: See all `.md` files in the repository
- 🐛 Issues: [GitHub Issues](https://github.com/jackstealer/syncchat/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/jackstealer/syncchat/discussions)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Atul Raj Gautam](https://github.com/jackstealer)

</div>
