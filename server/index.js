const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flatconnect';
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected successfully via ${mongoUri}`);
  } catch (error) {
    console.error(`MongoDB connection error using ${mongoUri}:`, error);

    if (mongoUri !== 'mongodb://localhost:27017/flatconnect') {
      console.log('Retrying with local MongoDB fallback...');
      try {
        await mongoose.connect('mongodb://localhost:27017/flatconnect', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully via local fallback');
        return;
      } catch (fallbackError) {
        console.error('Local MongoDB fallback connection error:', fallbackError);
      }
    }

    console.warn('Proceeding without MongoDB. Only demo login routes will function until database connectivity is restored.');
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/events', require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/users', require('./routes/users'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Flat Connect API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();