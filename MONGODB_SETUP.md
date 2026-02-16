# MongoDB Setup Guide

## Current Status

✅ **Frontend**: Running on http://localhost:3000
❌ **Backend**: Waiting for MongoDB connection
❌ **MongoDB**: Not connected

## Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - FREE & RECOMMENDED)

This is the easiest option and requires no local installation.

#### Steps:

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up with email or Google

2. **Create Free Cluster**
   - Click "Build a Database"
   - Select "FREE" (M0) tier
   - Choose any cloud provider and region
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `syncchat`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://syncchat:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name at the end: `/syncchat`

6. **Update Backend .env**
   - Open: `Real-Time Chat Application/backend/.env`
   - Replace the MONGODB_URI line with your connection string:
     ```
     MONGODB_URI=mongodb+srv://syncchat:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/syncchat?retryWrites=true&w=majority
     ```

7. **Restart Backend**
   - The backend will automatically restart (nodemon)
   - Check for "✅ MongoDB Connected" message

### Option 2: Install MongoDB Locally

#### Windows:

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Download Windows MSI installer
   - Run installer (choose "Complete" installation)
   - Check "Install MongoDB as a Service"

2. **Start MongoDB Service**
   ```cmd
   net start MongoDB
   ```

3. **Verify**
   ```cmd
   mongosh
   ```

#### macOS (with Homebrew):

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh
```

#### Linux (Ubuntu/Debian):

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh
```

## After MongoDB is Connected

Once MongoDB is connected, you'll see:

```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Database indexes created
```

Then you can:

1. **Open Frontend**: http://localhost:3000
2. **Register**: Create a new account
3. **Test**: Open incognito window, register another user
4. **Chat**: Start messaging in real-time!

## Troubleshooting

### "Authentication failed"
- Check username and password in connection string
- Ensure password is URL-encoded (no special characters)

### "Network timeout"
- Check internet connection
- Verify IP whitelist includes 0.0.0.0/0
- Wait a few minutes for cluster to be ready

### "Connection refused"
- For local MongoDB: Ensure service is running
- For Atlas: Check connection string format

## Current Server Status

Check the terminal output:
- Backend terminal should show MongoDB connection status
- Frontend should be accessible at http://localhost:3000

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- MongoDB Installation: https://docs.mongodb.com/manual/installation/
- Project Documentation: See INSTALLATION.md
