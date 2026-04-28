require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/mood');
const predictRoutes = require('./routes/predict');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/predict', predictRoutes);

// Health check route (used in testing)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date()
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});

// ── Database + Server Start (SAFE FOR TESTING) ──────────────────────────────
const PORT = process.env.PORT || 5000;

// 🚀 ONLY run DB + server if NOT in test mode
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');

      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      // ❗ DO NOT use process.exit here (breaks Jenkins)
    });
}

// Export app for testing
module.exports = app;