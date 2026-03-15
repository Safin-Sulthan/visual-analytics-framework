const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const path      = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes       = require('./routes/auth.routes');
const datasetRoutes    = require('./routes/dataset.routes');
const analyticsRoutes  = require('./routes/analytics.routes');
const insightRoutes    = require('./routes/insight.routes');
const reportRoutes     = require('./routes/report.routes');
const monitoringRoutes = require('./routes/monitoring.routes');
const errorMiddleware  = require('./middleware/error.middleware');

const app = express();

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// Security & logging
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting to all API routes
app.use('/api/', globalLimiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/datasets',   datasetRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/insights',   insightRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use(errorMiddleware);

module.exports = app;
