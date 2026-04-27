const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: ['https://test-2jro.vercel.app', 'http://localhost:3000'] }));
app.use(express.json());

const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  let storageMode = 'local file';

  if (!process.env.MONGO_URI) {
    console.warn('Missing MONGO_URI in backend/.env');
    console.warn('Starting with local file storage.');
  } else {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });

      storageMode = 'MongoDB';
      console.log('MongoDB connected');
    } catch (error) {
      console.warn('MongoDB connection failed. Starting with local file storage instead.');
      console.warn(error.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} using ${storageMode}`);
  });
}

startServer();
