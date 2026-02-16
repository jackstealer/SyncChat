# Installation Guide

Complete step-by-step installation guide for SyncChat.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`
   - Should show: v16.x.x or higher

2. **npm** (comes with Node.js)
   - Verify: `npm --version`
   - Should show: 8.x.x or higher

3. **MongoDB** (Choose one)
   - **Option A**: Local MongoDB
     - Download: https://www.mongodb.com/try/download/community
     - Verify: `mongod --version`
   - **Option B**: MongoDB Atlas (Cloud)
     - Sign up: https://www.mongodb.com/cloud/atlas
     - Free tier available

4. **Git** (optional, for cloning)
   - Download: https://git-scm.com/
   - Verify: `git --version`

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for dependencies
- **Internet**: Required for initial setup

## Installation Methods

### Method 1: Automated Setup (Recommended)

#### Windows
```bash
# Run setup script
setup.bat
```

#### macOS/Linux
```bash
# Make script executable
chmod +x setup.sh

# Run setup script
./setup.sh
```

### Method 2: Manual Setup

Follow the [Detailed Setup](#detailed-setup) section below.

## Detailed Setup

### Step 1: Get the Code

#### Option A: Clone Repository
```bash
git clone <repository-url>
cd Real-Time-Chat-Application
```

#### Option B: Download ZIP
1. Download ZIP from repository
2. Extract to desired location
3. Open terminal in extracted folder

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `backend/.env`:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Choose one)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/syncchat

# MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/syncchat

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_make_it_long

# CORS
CLIENT_URL=http://localhost:3000
```

**Generate JWT Secret:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator
# https://www.grc.com/passwords.htm
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `frontend/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 4: Database Setup

#### Option A: Local MongoDB

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or if installed via installer, it should auto-start
```

**macOS (Homebrew):**
```bash
# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list
```

**Linux:**
```bash
# Start MongoDB
sudo systemctl start mongod

# Enable auto-start
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

#### Option B: MongoDB Atlas

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password
   - Set role to "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `syncchat`
   - Update `MONGODB_URI` in `backend/.env`

## Configuration

### Backend Configuration

**`backend/.env` Options:**

```env
# Required
PORT=5000                    # Server port
NODE_ENV=development         # Environment (development/production)
MONGODB_URI=...             # Database connection string
JWT_SECRET=...              # JWT signing secret
CLIENT_URL=...              # Frontend URL for CORS

# Optional (for file uploads)
CLOUDINARY_CLOUD_NAME=...   # Cloudinary cloud name
CLOUDINARY_API_KEY=...      # Cloudinary API key
CLOUDINARY_API_SECRET=...   # Cloudinary API secret

# Optional (for scaling)
REDIS_URL=...               # Redis connection string
```

### Frontend Configuration

**`frontend/.env` Options:**

```env
# Required
REACT_APP_API_URL=http://localhost:5000      # Backend API URL
REACT_APP_SOCKET_URL=http://localhost:5000   # WebSocket server URL
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📡 WebSocket server ready
🌍 Environment: development
✅ MongoDB Connected: localhost
✅ Database indexes created
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!

You can now view syncchat-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

Browser should automatically open to `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

## Verification

### 1. Check Backend Health

Open browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 2. Check Frontend

Open browser to `http://localhost:3000`

You should see the login page.

### 3. Test Registration

1. Click "Sign up"
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign Up"
4. Should redirect to chat page

### 4. Test Real-Time Messaging

1. Open `http://localhost:3000` in regular browser
2. Register as User A
3. Open `http://localhost:3000` in incognito/private window
4. Register as User B
5. In User B's window: Click "New Chat" → Select User A
6. Send a message
7. Verify it appears instantly in User A's window

## Troubleshooting

### Backend Issues

#### Error: "Cannot find module"
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Error: "MongooseServerSelectionError"
**Cause**: MongoDB not running or wrong connection string

**Solution**:
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Or check connection string in .env
```

#### Error: "Port 5000 already in use"
**Solution 1**: Change port in `backend/.env`
```env
PORT=5001
```

**Solution 2**: Kill process on port 5000
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

#### Error: "JWT malformed"
**Solution**: Check JWT_SECRET in `backend/.env` is set and long enough

#### Error: "CORS error"
**Solution**: Verify CLIENT_URL in `backend/.env` matches frontend URL

### Frontend Issues

#### Error: "Port 3000 already in use"
**Solution**: Press `Y` to run on different port, or kill process
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

#### Error: "Cannot connect to server"
**Solution**:
1. Verify backend is running
2. Check `REACT_APP_API_URL` in `frontend/.env`
3. Check browser console for errors

#### Error: "WebSocket connection failed"
**Solution**:
1. Verify backend is running
2. Check `REACT_APP_SOCKET_URL` in `frontend/.env`
3. Check browser console for WebSocket errors
4. Verify no firewall blocking WebSocket connections

#### Error: "Module not found"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

#### Error: "Authentication failed"
**Solution**: Check MongoDB username/password in connection string

#### Error: "Network timeout"
**Solution**: 
1. Check internet connection
2. Verify IP whitelist in MongoDB Atlas
3. Try adding 0.0.0.0/0 to whitelist

#### Error: "Database not found"
**Solution**: Database will be created automatically on first connection

### General Issues

#### Application is slow
**Solutions**:
1. Check internet connection
2. Restart backend and frontend
3. Clear browser cache
4. Check MongoDB performance

#### Messages not sending
**Solutions**:
1. Check WebSocket connection (green indicator)
2. Check browser console for errors
3. Check backend logs
4. Verify MongoDB is running

#### Dark mode not working
**Solutions**:
1. Clear browser localStorage
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors

## Additional Help

### Logs

**Backend Logs:**
- Check terminal where backend is running
- Look for error messages

**Frontend Logs:**
- Open browser DevTools (F12)
- Check Console tab
- Check Network tab for failed requests

### Database Inspection

**MongoDB Compass:**
1. Download: https://www.mongodb.com/products/compass
2. Connect using your MongoDB URI
3. Browse collections: users, conversations, messages

**MongoDB Shell:**
```bash
# Connect to local MongoDB
mongosh

# Use database
use syncchat

# Show collections
show collections

# Query users
db.users.find()
```

### Reset Application

**Clear Database:**
```bash
# MongoDB Shell
mongosh
use syncchat
db.dropDatabase()
```

**Clear Frontend State:**
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear localStorage
4. Refresh page

### Getting Help

1. Check documentation in `/docs` folder
2. Review error messages carefully
3. Search for error in documentation
4. Check GitHub issues
5. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Logs

## Next Steps

After successful installation:

1. Read [QUICKSTART.md](./QUICKSTART.md) for quick testing
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
3. Check [FEATURES_CHECKLIST.md](./FEATURES_CHECKLIST.md) for all features
4. See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
5. Review [TESTING.md](./TESTING.md) for testing guidelines

## Support

For issues and questions:
- Documentation: Check all `.md` files in project root
- GitHub Issues: Report bugs and request features
- Email: [Your contact email]

Happy coding! 🚀
