const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) || []),
].filter(Boolean);

const allowedOriginPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/.+\.vercel\.app$/,
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      configuredOrigins.includes(origin) ||
      allowedOriginPatterns.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

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
