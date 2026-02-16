# Quick Start Guide

Get SyncChat running locally in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git installed

## Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd Real-Time-Chat-Application
```

## Step 2: Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/syncchat
JWT_SECRET=your_secret_key_here_make_it_long_and_random
CLIENT_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📡 WebSocket server ready
✅ MongoDB Connected: localhost
```

## Step 3: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start frontend:
```bash
npm start
```

Browser should open automatically at `http://localhost:3000`

## Step 4: Test the Application

1. **Register First User**
   - Click "Sign up"
   - Enter username: `alice`
   - Enter email: `alice@example.com`
   - Enter password: `password123`
   - Click "Sign Up"

2. **Open Incognito Window**
   - Open `http://localhost:3000` in incognito/private mode

3. **Register Second User**
   - Username: `bob`
   - Email: `bob@example.com`
   - Password: `password123`

4. **Start Chatting**
   - In Bob's window: Click "New Chat" → Select Alice
   - Type a message and press Enter
   - Watch it appear instantly in Alice's window!

5. **Test Features**
   - ✅ Typing indicators (start typing, see indicator)
   - ✅ Online status (green dot when online)
   - ✅ Read receipts (double check when read)
   - ✅ Dark mode (click moon icon)

## Troubleshooting

### Backend won't start

**Error**: `MongooseServerSelectionError`
- **Solution**: Make sure MongoDB is running
  ```bash
  # Start MongoDB (macOS)
  brew services start mongodb-community
  
  # Start MongoDB (Windows)
  net start MongoDB
  
  # Or use MongoDB Atlas connection string
  ```

**Error**: `Port 5000 already in use`
- **Solution**: Change PORT in `.env` to 5001

### Frontend won't start

**Error**: `Port 3000 already in use`
- **Solution**: Press `Y` to run on different port, or kill process on 3000

### WebSocket not connecting

**Error**: "Disconnected from chat server"
- **Solution**: 
  1. Check backend is running
  2. Verify `REACT_APP_SOCKET_URL` in frontend `.env`
  3. Check browser console for errors

### Messages not sending

1. Check browser console for errors
2. Verify WebSocket connection (should see green "Connected")
3. Check backend logs for errors
4. Ensure MongoDB is running

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
- See [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
- Review [TESTING.md](./TESTING.md) for testing guidelines

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests

# Frontend
cd frontend
npm install          # Install dependencies
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

## Default Ports

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- WebSocket: `ws://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

## Environment Variables Quick Reference

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/syncchat
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Common Issues

### Issue: "Cannot find module"
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "CORS error"
- Check `CLIENT_URL` in backend `.env` matches frontend URL
- Restart backend after changing `.env`

### Issue: "JWT malformed"
- Clear browser localStorage
- Re-login

### Issue: Dark mode not working
- Clear browser cache
- Check browser console for errors

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Console Logs**: Check browser console and terminal for debug info
3. **MongoDB GUI**: Use MongoDB Compass to view database
4. **API Testing**: Use Postman or Thunder Client for API testing
5. **WebSocket Testing**: Use Socket.IO client tester

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in console/terminal
3. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system understanding
4. Open an issue on GitHub with error details

Happy coding! 🚀
