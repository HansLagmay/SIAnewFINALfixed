require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { migratePasswords } = require('./utils/migrate-passwords');
const { apiLimiter } = require('./middleware/rateLimiter');

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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/properties', require('./routes/properties'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/users', require('./routes/users'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/login', require('./routes/auth'));
app.use('/api/activity-log', require('./routes/activity-log'));
app.use('/api/database', require('./routes/database'));

// Health check (no auth required)
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
  
  // Handle multer errors
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size exceeds 5MB limit' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Start server and run password migration
const startServer = async () => {
  try {
    // Run password migration on startup
    console.log('🔐 Running password migration...');
    await migratePasswords();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════════╗');
      console.log('║   TES Property System - Backend API       ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`🌐 CORS enabled for: ${CORS_ORIGIN}`);
      console.log(`📊 API endpoints available at: http://localhost:${PORT}/api`);
      console.log('');
      console.log('🔒 Security Features:');
      console.log('  ✅ Password hashing with bcrypt');
      console.log('  ✅ JWT authentication');
      console.log('  ✅ Input sanitization');
      console.log('  ✅ Rate limiting');
      console.log('  ✅ File locking for data integrity');
      console.log('  ✅ Automatic backups');
      console.log('');
      console.log('Available routes:');
      console.log('  - GET  /api/health (public)');
      console.log('  - POST /api/login (public, rate limited)');
      console.log('  - GET  /api/properties (public, paginated)');
      console.log('  - POST /api/inquiries (public, rate limited, sanitized)');
      console.log('  - All other routes (protected with JWT)');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
