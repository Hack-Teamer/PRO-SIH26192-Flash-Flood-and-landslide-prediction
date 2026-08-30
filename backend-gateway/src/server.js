const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/auth');
const villageRoutes = require('./routes/villages');
const alertRoutes = require('./routes/alerts');
const sensorRoutes = require('./routes/sensors');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/villages', villageRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/sensors', sensorRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', gateway: 'Express.js API Gateway', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  
  socket.emit('connection-ack', {
    status: 'CONNECTED',
    server_time: new Date().toISOString(),
    message: 'Connected to Flash Flood Early Warning System Gateway'
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ Express API Gateway listening on port ${PORT}`);
  console.log(`⚡ WebSocket Server ready for live risk updates`);
  console.log(`=======================================================`);
});
