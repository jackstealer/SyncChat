# Scalability Guide

## Current Architecture Limitations

The current single-server architecture has these limitations:

1. **Single Point of Failure**: If the server goes down, all users are disconnected
2. **Memory Constraints**: All active connections stored in single server memory
3. **CPU Bottleneck**: All message processing on one server
4. **No Load Distribution**: Cannot distribute load across multiple servers

## Scaling Strategy

### Phase 1: Vertical Scaling (Current → 1K Users)

**Approach**: Increase server resources

**Implementation**:
```
Single Server
├── 2 CPU cores → 4 CPU cores
├── 2 GB RAM → 8 GB RAM
└── Optimize database queries
```

**Actions**:
1. Upgrade server instance (Render: Starter → Standard)
2. Add database indexes
3. Implement connection pooling
4. Enable compression

**Cost**: ~$25-50/month

### Phase 2: Horizontal Scaling with Redis (1K → 10K Users)

**Approach**: Multiple server instances with Redis Pub/Sub

**Architecture**:
```
                    ┌─────────────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Server 1 │       │Server 2 │       │Server 3 │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │Redis Pub/Sub│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  MongoDB    │
                    └─────────────┘
```

**Implementation**:

1. **Install Redis Adapter**
```bash
npm install @socket.io/redis-adapter redis
```

2. **Update Socket.IO Configuration**
```javascript
// backend/src/socket/index.js
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ 
  url: process.env.REDIS_URL 
});
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));
```

3. **Configure Load Balancer**
```nginx
# nginx.conf
upstream backend {
    ip_hash;  # Sticky sessions
    server server1.example.com:5000;
    server server2.example.com:5000;
    server server3.example.com:5000;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

**Cost**: ~$100-200/month (3 servers + Redis + Load Balancer)

### Phase 3: Microservices Architecture (10K → 100K Users)

**Approach**: Separate services for different concerns

**Architecture**:
```
                    ┌─────────────┐
                    │ API Gateway │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────┐
        │                  │                  │              │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐   ┌────▼────┐
   │  Auth   │       │ Message │       │Presence │   │  File   │
   │ Service │       │ Service │       │ Service │   │ Service │
   └────┬────┘       └────┬────┘       └────┬────┘   └────┬────┘
        │                  │                  │              │
        └──────────────────┼──────────────────┴──────────────┘
                           │
                    ┌──────▼──────┐
                    │  RabbitMQ   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │MongoDB  │       │  Redis  │       │   S3    │
   │Cluster  │       │ Cluster │       │ Bucket  │
   └─────────┘       └─────────┘       └─────────┘
```

**Services Breakdown**:

1. **Auth Service**
   - User registration/login
   - JWT token generation
   - Session management

2. **Message Service**
   - Message CRUD operations
   - Real-time delivery
   - Message history

3. **Presence Service**
   - Online/offline status
   - Last seen tracking
   - Typing indicators

4. **File Service**
   - Image uploads
   - File storage (S3)
   - CDN integration

**Implementation**:

```javascript
// message-service/index.js
const express = require('express');
const amqp = require('amqplib');

const app = express();
const RABBITMQ_URL = process.env.RABBITMQ_URL;

// Connect to RabbitMQ
const connection = await amqp.connect(RABBITMQ_URL);
const channel = await connection.createChannel();

// Subscribe to message queue
await channel.assertQueue('messages');
channel.consume('messages', async (msg) => {
  const message = JSON.parse(msg.content.toString());
  await processMessage(message);
  channel.ack(msg);
});

// Publish message
app.post('/send', async (req, res) => {
  const message = req.body;
  channel.sendToQueue('messages', Buffer.from(JSON.stringify(message)));
  res.json({ success: true });
});
```

**Cost**: ~$500-1000/month

### Phase 4: Global Distribution (100K+ Users)

**Approach**: Multi-region deployment with CDN

**Architecture**:
```
                    ┌─────────────┐
                    │  CloudFlare │
                    │     CDN     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │  US     │       │   EU    │       │  ASIA   │
   │ Region  │       │ Region  │       │ Region  │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Global    │
                    │  Database   │
                    └─────────────┘
```

**Implementation**:
- Deploy to multiple AWS/GCP regions
- Use CloudFlare for global CDN
- Implement geo-routing
- Use MongoDB Atlas global clusters

**Cost**: ~$2000+/month

## Database Optimization

### Indexing Strategy

```javascript
// Compound indexes for common queries
db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ sender: 1, createdAt: -1 });
db.conversations.createIndex({ participants: 1, updatedAt: -1 });
db.users.createIndex({ username: 1, email: 1 });
```

### Sharding Strategy

```javascript
// Shard by conversationId for even distribution
sh.shardCollection("syncchat.messages", { conversationId: "hashed" });
```

### Read Replicas

```javascript
// Configure read preference
mongoose.connect(MONGODB_URI, {
  readPreference: 'secondaryPreferred'
});
```

## Caching Strategy

### Redis Caching Layers

1. **User Presence Cache**
```javascript
// Cache online users
await redis.sadd('online_users', userId);
await redis.expire('online_users', 300); // 5 minutes
```

2. **Conversation List Cache**
```javascript
// Cache user's conversations
const cacheKey = `conversations:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const conversations = await fetchConversations(userId);
await redis.setex(cacheKey, 300, JSON.stringify(conversations));
```

3. **Message History Cache**
```javascript
// Cache recent messages
const cacheKey = `messages:${conversationId}:recent`;
await redis.lpush(cacheKey, JSON.stringify(message));
await redis.ltrim(cacheKey, 0, 49); // Keep last 50
await redis.expire(cacheKey, 3600); // 1 hour
```

## Message Queue Integration

### RabbitMQ for Async Processing

```javascript
// Producer
const sendMessage = async (message) => {
  await channel.sendToQueue('messages', 
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};

// Consumer
channel.consume('messages', async (msg) => {
  const message = JSON.parse(msg.content.toString());
  
  // Process message
  await saveToDatabase(message);
  await sendPushNotification(message);
  await updateSearchIndex(message);
  
  channel.ack(msg);
}, { noAck: false });
```

## Monitoring & Observability

### Metrics to Track

1. **System Metrics**
   - CPU usage
   - Memory usage
   - Network I/O
   - Disk I/O

2. **Application Metrics**
   - Active WebSocket connections
   - Messages per second
   - API response times
   - Error rates

3. **Business Metrics**
   - Active users
   - Messages sent
   - Conversations created
   - User retention

### Tools

- **Prometheus + Grafana**: Metrics collection and visualization
- **ELK Stack**: Log aggregation and analysis
- **Sentry**: Error tracking
- **New Relic**: APM monitoring

### Implementation

```javascript
// Prometheus metrics
const promClient = require('prom-client');

const activeConnections = new promClient.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections'
});

const messagesTotal = new promClient.Counter({
  name: 'messages_total',
  help: 'Total number of messages sent'
});

io.on('connection', (socket) => {
  activeConnections.inc();
  
  socket.on('disconnect', () => {
    activeConnections.dec();
  });
  
  socket.on('send_message', () => {
    messagesTotal.inc();
  });
});
```

## Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Message Latency | < 100ms | ~50ms |
| API Response Time | < 200ms | ~150ms |
| WebSocket Connections | 10,000+ | 1,000 |
| Messages/Second | 1,000+ | 100 |
| Database Queries | < 50ms | ~30ms |

### Load Testing Results

```bash
# Artillery load test
artillery run load-test.yml

# Expected output:
# Scenarios launched: 5000
# Scenarios completed: 5000
# Requests completed: 50000
# Mean response time: 145ms
# p95 response time: 280ms
# p99 response time: 450ms
```

## Cost Optimization

### Strategies

1. **Auto-scaling**: Scale down during low traffic
2. **Spot Instances**: Use for non-critical workloads
3. **Reserved Instances**: For predictable baseline load
4. **CDN Caching**: Reduce origin server load
5. **Database Optimization**: Reduce query costs

### Cost Breakdown (10K Users)

| Service | Monthly Cost |
|---------|-------------|
| Compute (3 servers) | $150 |
| Database (MongoDB Atlas M10) | $60 |
| Redis (Managed) | $30 |
| Load Balancer | $20 |
| CDN (CloudFlare) | $20 |
| Monitoring | $20 |
| **Total** | **$300** |

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Automated daily backups
   - Point-in-time recovery
   - Cross-region replication

2. **Application State**
   - Redis persistence (AOF + RDB)
   - Message queue durability

3. **Recovery Plan**
   - RTO (Recovery Time Objective): < 1 hour
   - RPO (Recovery Point Objective): < 5 minutes

### Implementation

```javascript
// Automated backup script
const backup = async () => {
  const timestamp = new Date().toISOString();
  
  // Backup MongoDB
  await exec(`mongodump --uri="${MONGODB_URI}" --out="backup-${timestamp}"`);
  
  // Upload to S3
  await s3.upload({
    Bucket: 'syncchat-backups',
    Key: `backup-${timestamp}.tar.gz`,
    Body: fs.createReadStream(`backup-${timestamp}.tar.gz`)
  });
};

// Run daily at 2 AM
cron.schedule('0 2 * * *', backup);
```
