# Deployment Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account
- Vercel account (for frontend)
- Render/Railway account (for backend)

## Backend Deployment (Render/Railway)

### Option 1: Render

1. **Create a new Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```

3. **Environment Variables**
   Add the following in Render dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://syncchat-api.onrender.com`)

### Option 2: Railway

1. **Create New Project**
   - Go to [Railway](https://railway.app/)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**
   Same as Render configuration above

4. **Deploy**
   - Railway will auto-deploy on push
   - Get your deployment URL from settings

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update Environment Variables**
   Create `.env.production` in frontend folder:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_SOCKET_URL=https://your-backend-url.onrender.com
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Project**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. **Add Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL`

### Alternative: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - Root Directory: `frontend`
   - Framework: Create React App
   - Add environment variables
5. Click "Deploy"

## Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Choose a cloud provider and region

2. **Create Database User**
   - Go to Database Access
   - Add new database user
   - Save username and password

3. **Whitelist IP Addresses**
   - Go to Network Access
   - Add IP Address
   - Allow access from anywhere: `0.0.0.0/0` (for production, use specific IPs)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `syncchat`)

## Post-Deployment Configuration

### Update CORS Settings

In `backend/server.js`, update CORS origin:
```javascript
app.use(cors({
  origin: 'https://your-frontend-url.vercel.app',
  credentials: true
}));
```

### Update Socket.IO CORS

In `backend/src/socket/index.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: 'https://your-frontend-url.vercel.app',
    credentials: true
  }
});
```

## Testing Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**
   - Open your Vercel URL
   - Register a new account
   - Try sending messages

3. **Test WebSocket Connection**
   - Open browser console
   - Look for "Socket connected" message
   - Check Network tab for WebSocket connection

## Monitoring

### Backend Logs (Render)
- Go to your service dashboard
- Click "Logs" tab
- Monitor for errors

### Frontend Logs (Vercel)
- Go to your project dashboard
- Click "Deployments"
- Click on a deployment → "View Function Logs"

## Troubleshooting

### WebSocket Connection Issues

1. **Check CORS Configuration**
   - Ensure frontend URL is whitelisted in backend CORS

2. **Check Environment Variables**
   - Verify `REACT_APP_SOCKET_URL` points to correct backend URL

3. **Check Network Tab**
   - Look for WebSocket upgrade request
   - Check for 101 Switching Protocols response

### Database Connection Issues

1. **Verify Connection String**
   - Check MongoDB URI format
   - Ensure password is URL-encoded

2. **Check IP Whitelist**
   - Ensure `0.0.0.0/0` is added (or specific IPs)

3. **Check Database User Permissions**
   - Ensure user has read/write access

### Authentication Issues

1. **Check JWT Secret**
   - Ensure same secret in all environments

2. **Check Token Expiry**
   - Default is 7 days, adjust if needed

## Scaling Considerations

### For High Traffic

1. **Enable Redis for Socket.IO**
   ```javascript
   const { createAdapter } = require('@socket.io/redis-adapter');
   const { createClient } = require('redis');
   
   const pubClient = createClient({ url: process.env.REDIS_URL });
   const subClient = pubClient.duplicate();
   
   io.adapter(createAdapter(pubClient, subClient));
   ```

2. **Use MongoDB Replica Set**
   - Upgrade to MongoDB Atlas M10+ cluster
   - Enable replica set for high availability

3. **Enable CDN for Frontend**
   - Vercel automatically provides CDN
   - No additional configuration needed

4. **Horizontal Scaling**
   - Render: Increase instance count in settings
   - Railway: Enable autoscaling

## Cost Optimization

### Free Tier Limits

**Render Free Tier:**
- 750 hours/month
- Spins down after 15 minutes of inactivity
- 512 MB RAM

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared cluster

### Recommendations

- Start with free tiers for development/testing
- Upgrade to paid plans for production
- Monitor usage in dashboards

## Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Whitelist specific IPs in MongoDB
- [ ] Use strong database passwords
- [ ] Enable MongoDB encryption at rest
- [ ] Implement input validation
- [ ] Add request size limits

## Backup Strategy

1. **Database Backups**
   - MongoDB Atlas provides automatic backups
   - Configure backup schedule in Atlas dashboard

2. **Code Backups**
   - Use Git for version control
   - Push to GitHub regularly

3. **Environment Variables**
   - Keep a secure backup of all environment variables
   - Use a password manager or encrypted file
