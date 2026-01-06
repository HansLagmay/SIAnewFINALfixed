require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/properties', require('./routes/properties'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/users', require('./routes/users'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/login', require('./routes/auth'));
app.use('/api/activity-log', require('./routes/activity-log'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TES Property API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   TES Property System - Backend API       ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`📊 API endpoints available at: http://localhost:${PORT}/api`);
  console.log('');
  console.log('Available routes:');
  console.log('  - GET  /api/health');
  console.log('  - POST /api/login');
  console.log('  - GET  /api/properties');
  console.log('  - GET  /api/inquiries');
  console.log('  - GET  /api/users');
  console.log('  - GET  /api/calendar');
  console.log('  - GET  /api/activity-log');
  console.log('');
});
