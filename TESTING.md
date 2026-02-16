# Testing Guide

## Manual Testing

### Test Cases

#### 1. Authentication Tests

**Test Case 1.1: User Registration**
- Navigate to `/register`
- Fill in username, email, password
- Click "Sign Up"
- Expected: Redirect to chat page, token stored in localStorage

**Test Case 1.2: User Login**
- Navigate to `/login`
- Enter valid credentials
- Click "Sign In"
- Expected: Redirect to chat page, user data loaded

**Test Case 1.3: Invalid Login**
- Enter invalid credentials
- Expected: Error toast message displayed

**Test Case 1.4: Token Persistence**
- Login successfully
- Refresh page
- Expected: User remains logged in

#### 2. Real-Time Messaging Tests

**Test Case 2.1: Send Message**
- Open chat with a user
- Type message and press Enter
- Expected: Message appears immediately in chat window

**Test Case 2.2: Receive Message**
- Open two browser windows (different users)
- Send message from User A
- Expected: User B receives message instantly

**Test Case 2.3: Message Persistence**
- Send messages
- Refresh page
- Expected: Messages still visible

**Test Case 2.4: Empty Message**
- Try to send empty message
- Expected: Send button disabled

#### 3. WebSocket Connection Tests

**Test Case 3.1: Initial Connection**
- Login to application
- Check browser console
- Expected: "Socket connected" message

**Test Case 3.2: Reconnection**
- Disconnect internet
- Reconnect internet
- Expected: Automatic reconnection, "Connected to chat server" toast

**Test Case 3.3: Connection Status**
- Check sidebar for connection indicator
- Expected: Green "Connected" status when online

#### 4. Typing Indicator Tests

**Test Case 4.1: Show Typing**
- Open chat in two windows
- Start typing in User A window
- Expected: User B sees "User A is typing..."

**Test Case 4.2: Stop Typing**
- Stop typing for 2 seconds
- Expected: Typing indicator disappears

#### 5. Online Presence Tests

**Test Case 5.1: User Goes Online**
- User A logs in
- Expected: User B sees User A with green dot

**Test Case 5.2: User Goes Offline**
- User A logs out
- Expected: User B sees User A without green dot

**Test Case 5.3: Last Seen**
- User goes offline
- Expected: "Last seen at [time]" displayed

#### 6. Read Receipts Tests

**Test Case 6.1: Mark as Read**
- User A sends message
- User B opens conversation
- Expected: Message marked as read (double check icon)

**Test Case 6.2: Unread Messages**
- User A sends message
- User B doesn't open conversation
- Expected: Message shows single check icon

#### 7. Conversation Management Tests

**Test Case 7.1: Create New Conversation**
- Click "New Chat"
- Select a user
- Expected: New conversation created

**Test Case 7.2: Existing Conversation**
- Try to create conversation with existing user
- Expected: Opens existing conversation

**Test Case 7.3: Conversation List Order**
- Send message in conversation
- Expected: Conversation moves to top of list

#### 8. Search Tests

**Test Case 8.1: Search Users**
- Click "New Chat"
- Type username in search
- Expected: Filtered user list

**Test Case 8.2: Empty Search**
- Clear search field
- Expected: All users displayed

#### 9. Dark Mode Tests

**Test Case 9.1: Toggle Dark Mode**
- Click moon/sun icon
- Expected: Theme switches, preference saved

**Test Case 9.2: Dark Mode Persistence**
- Enable dark mode
- Refresh page
- Expected: Dark mode still enabled

#### 10. Responsive Design Tests

**Test Case 10.1: Mobile View**
- Resize browser to mobile width
- Expected: Sidebar and chat window stack properly

**Test Case 10.2: Tablet View**
- Resize to tablet width
- Expected: Layout adjusts appropriately

## Automated Testing

### Backend Unit Tests

Create `backend/tests/auth.test.js`:

```javascript
const request = require('supertest');
const { app } = require('../server');
const User = require('../src/models/User');

describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('POST /api/auth/register - Success', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/register - Duplicate User', async () => {
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/auth/login - Success', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - Invalid Credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

### WebSocket Tests

Create `backend/tests/socket.test.js`:

```javascript
const io = require('socket.io-client');
const { server } = require('../server');
const jwt = require('jsonwebtoken');

describe('Socket.IO', () => {
  let clientSocket;
  let token;

  beforeAll((done) => {
    // Generate test token
    token = jwt.sign({ id: 'testuser123' }, process.env.JWT_SECRET);
    done();
  });

  beforeEach((done) => {
    clientSocket = io('http://localhost:5000', {
      auth: { token }
    });
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  test('should connect with valid token', (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });

  test('should emit and receive message', (done) => {
    clientSocket.emit('send_message', {
      conversationId: 'test123',
      content: 'Hello World',
      type: 'text'
    }, (response) => {
      expect(response.success).toBe(true);
      done();
    });
  });

  test('should receive typing indicator', (done) => {
    clientSocket.on('typing_status', (data) => {
      expect(data.isTyping).toBeDefined();
      done();
    });

    clientSocket.emit('typing', {
      conversationId: 'test123',
      isTyping: true
    });
  });
});
```

### Run Tests

```bash
# Backend tests
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Performance Testing

### Load Testing with Artillery

Install Artillery:
```bash
npm install -g artillery
```

Create `load-test.yml`:
```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
  socketio:
    transports: ["websocket"]

scenarios:
  - name: "Send messages"
    engine: socketio
    flow:
      - emit:
          channel: "send_message"
          data:
            conversationId: "test123"
            content: "Load test message"
            type: "text"
      - think: 1
```

Run load test:
```bash
artillery run load-test.yml
```

## Edge Cases to Test

1. **Network Issues**
   - Slow connection
   - Intermittent disconnections
   - Complete network loss

2. **Concurrent Actions**
   - Multiple users typing simultaneously
   - Rapid message sending
   - Simultaneous logins

3. **Large Data**
   - Very long messages (5000 characters)
   - Many conversations (100+)
   - Large message history (1000+ messages)

4. **Browser Compatibility**
   - Chrome
   - Firefox
   - Safari
   - Edge

5. **Security**
   - XSS attempts in messages
   - SQL injection attempts
   - Invalid tokens
   - Expired tokens

## Test Checklist

- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Messages send in real-time
- [ ] Messages persist after refresh
- [ ] Typing indicators work
- [ ] Online status updates
- [ ] Read receipts work
- [ ] Dark mode toggles
- [ ] Search functionality works
- [ ] Responsive on mobile
- [ ] WebSocket reconnects automatically
- [ ] Rate limiting prevents spam
- [ ] Invalid inputs are rejected
- [ ] Errors display user-friendly messages
