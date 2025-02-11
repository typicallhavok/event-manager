const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
// Add this line to import the Event model
const Event = require('./models/Event');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173',`${process.env.FRONTEND_URL}`],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// After io initialization
app.set('io', io);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173',`${process.env.FRONTEND_URL}`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

app.get('/api/health', (req, res) => {
  console.log('Health check');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

io.engine.on("connection_error", (err) => {
  console.log('Socket.IO connection error:', err);
});

io.on('connection', (socket) => {

  socket.on('joinEvent', async (eventId) => {
    try {
      socket.join(`event:${eventId}`);

      const event = await Event.findById(eventId);
      if (event) {
        socket.emit('attendeeUpdate', {
          eventId: event._id,
          count: event.attendees.length
        });
      }
    } catch (error) {
      console.error('Error in joinEvent:', error);
    }
  });

  socket.on('leaveEvent', (eventId) => {
    socket.leave(`event:${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Update event registration to emit socket events
// app.post('/api/events/:id/register', verifyToken, async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     if (!event.attendees.includes(req.user.userId)) {
//       event.attendees.push(req.user.userId);
//       await event.save();

//       // Emit updated attendee count
//       io.to(`event:${event._id}`).emit('attendeeUpdate', {
//         eventId: event._id,
//         count: event.attendees.length
//       });
//     }

//     res.json({ message: 'Successfully registered for event' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Start server
httpServer.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});