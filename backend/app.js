require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const client = require('prom-client');

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

// ── Prometheus Metrics Setup ────────────────────────────────────────────────

// Collect default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics();

// Custom HTTP request counter (optional but HIGH HD level)
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Middleware to track requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/predict', predictRoutes);

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
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
    error: err.message || 'Internal server error',
  });
});

// ── Database + Server Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {

  // Try DB connection but DON'T block server
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.log('❌ MongoDB connection failed:', err.message));

  // 🚀 ALWAYS start server (critical fix)
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export app for testing
module.exports = app;