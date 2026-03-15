require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const datasetRoutes = require('./routes/datasets');
const edaRoutes = require('./routes/eda');
const analyticsRoutes = require('./routes/analytics');
const insightRoutes = require('./routes/insights');
const temporalRoutes = require('./routes/temporal');
const predictionRoutes = require('./routes/predictions');
const anomalyRoutes = require('./routes/anomalies');
const nlpRoutes = require('./routes/nlp');
const reportRoutes = require('./routes/reports');
const { notFound, error } = require('./utils/apiResponse');

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached, please try again later.' },
});

app.use('/api/auth', authLimiter);
app.use('/api/datasets/upload', uploadLimiter);
app.use('/api/', generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/eda', edaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/temporal', temporalRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use((_req, res) => notFound(res, 'Route not found'));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[UnhandledError]', err);
  return error(res, err.message || 'Internal server error', err.status || 500);
});

module.exports = app;
