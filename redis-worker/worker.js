'use strict';

require('dotenv').config();

const { Worker, UnrecoverableError } = require('bullmq');
const IORedis = require('ioredis');
const axios = require('axios');
const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGODB_URI = process.env.MONGODB_URI;
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const QUEUE_NAME = 'analytics';

const AI_ENGINE_TIMEOUT_MS = 5 * 60 * 1000; // 5 min — analysis can be slow
const MAX_JOB_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

if (!MONGODB_URI) {
  console.error('[worker] MONGODB_URI is required. Exiting.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Mongoose models (inline, matching backend schemas)
// ---------------------------------------------------------------------------
const columnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['numeric', 'categorical', 'datetime', 'boolean', 'unknown'],
    },
    nullable: { type: Boolean, default: false },
  },
  { _id: false }
);

const datasetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    columns: [columnSchema],
    rowCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    currentVersion: { type: Number, default: 1 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const insightSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['eda', 'anomaly', 'cluster', 'prediction', 'correlation', 'trend'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  score: { type: Number, default: 0 },
  statisticalSignificance: { type: Number, min: 0, max: 1, default: 0 },
  businessImpact: { type: Number, min: 0, max: 1, default: 0 },
  anomalySeverity: { type: Number, min: 0, max: 1, default: 0 },
  chartConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const alertSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['anomaly', 'trend_change', 'growth', 'decline', 'seasonal'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const datasetVersionSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true,
  },
  version: { type: Number, required: true },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

datasetVersionSchema.index({ datasetId: 1, version: 1 }, { unique: true });

// Guard against re-registration when nodemon hot-reloads
const Dataset =
  mongoose.models.Dataset || mongoose.model('Dataset', datasetSchema);
const Insight =
  mongoose.models.Insight || mongoose.model('Insight', insightSchema);
const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
const DatasetVersion =
  mongoose.models.DatasetVersion ||
  mongoose.model('DatasetVersion', datasetVersionSchema);

// ---------------------------------------------------------------------------
// MongoDB connection
// ---------------------------------------------------------------------------
async function connectMongo() {
  mongoose.connection.on('disconnected', () =>
    console.warn('[mongo] Disconnected — Mongoose will auto-reconnect')
  );
  mongoose.connection.on('reconnected', () =>
    console.info('[mongo] Reconnected')
  );
  mongoose.connection.on('error', (err) =>
    console.error('[mongo] Connection error:', err.message)
  );

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  console.info('[mongo] Connected to MongoDB');
}

// ---------------------------------------------------------------------------
// Redis connection (shared between Worker and BullMQ)
// ---------------------------------------------------------------------------
function createRedisConnection() {
  const conn = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    reconnectOnError: (err) => {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
      return targetErrors.some((e) => err.message.includes(e));
    },
    retryStrategy: (times) => {
      const delay = Math.min(times * 500, 10000);
      console.warn(`[redis] Retry #${times}, waiting ${delay}ms`);
      return delay;
    },
  });

  conn.on('connect', () => console.info('[redis] Connected'));
  conn.on('ready', () => console.info('[redis] Ready'));
  conn.on('error', (err) => console.error('[redis] Error:', err.message));
  conn.on('close', () => console.warn('[redis] Connection closed'));
  conn.on('reconnecting', () => console.info('[redis] Reconnecting…'));

  return conn;
}

// ---------------------------------------------------------------------------
// AI engine call
// ---------------------------------------------------------------------------
async function callAiEngine(datasetId, filePath) {
  const url = `${AI_ENGINE_URL}/analyze`;
  console.info(`[ai-engine] POST ${url} — dataset=${datasetId}`);

  const { data } = await axios.post(
    url,
    { dataset_id: datasetId, file_path: filePath },
    {
      timeout: AI_ENGINE_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return data; // expected: { insights: [...], alerts: [...], metadata?: {...} }
}

// ---------------------------------------------------------------------------
// Persist results to MongoDB (all writes in one session)
// ---------------------------------------------------------------------------
async function persistResults(datasetId, results, job) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dataset = await Dataset.findById(datasetId).session(session);
    if (!dataset) {
      throw new UnrecoverableError(`Dataset ${datasetId} not found in MongoDB`);
    }

    const nextVersion = (dataset.currentVersion || 1) + 1;

    // 1. Upsert insights
    const insightDocs = [];
    for (const raw of results.insights || []) {
      insightDocs.push({
        datasetId: dataset._id,
        type: raw.type,
        title: raw.title,
        description: raw.description || '',
        score: raw.score ?? 0,
        statisticalSignificance: raw.statisticalSignificance ?? 0,
        businessImpact: raw.businessImpact ?? 0,
        anomalySeverity: raw.anomalySeverity ?? 0,
        chartConfig: raw.chartConfig || {},
        data: raw.data || {},
        isActive: true,
      });
    }

    if (insightDocs.length > 0) {
      await Insight.insertMany(insightDocs, { session });
      console.info(
        `[job:${job.id}] Stored ${insightDocs.length} insight(s)`
      );
    }

    // 2. Upsert alerts
    const alertDocs = [];
    for (const raw of results.alerts || []) {
      alertDocs.push({
        datasetId: dataset._id,
        type: raw.type,
        severity: raw.severity,
        title: raw.title,
        description: raw.description || '',
        data: raw.data || {},
        isRead: false,
      });
    }

    if (alertDocs.length > 0) {
      await Alert.insertMany(alertDocs, { session });
      console.info(
        `[job:${job.id}] Stored ${alertDocs.length} alert(s)`
      );
    }

    // 3. Create DatasetVersion
    await DatasetVersion.create(
      [
        {
          datasetId: dataset._id,
          version: nextVersion,
          changes: results.metadata || {},
          snapshot: {
            rowCount: dataset.rowCount,
            columns: dataset.columns,
            tags: dataset.tags,
          },
          uploadedBy: dataset.uploadedBy,
        },
      ],
      { session }
    );
    console.info(
      `[job:${job.id}] Created DatasetVersion v${nextVersion}`
    );

    // 4. Mark dataset completed
    await Dataset.updateOne(
      { _id: dataset._id },
      {
        $set: {
          status: 'completed',
          currentVersion: nextVersion,
          metadata: { ...dataset.metadata, ...(results.metadata || {}) },
        },
      },
      { session }
    );

    await session.commitTransaction();
    console.info(`[job:${job.id}] Transaction committed`);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ---------------------------------------------------------------------------
// Job processor
// ---------------------------------------------------------------------------
async function processJob(job) {
  const { dataset_id: datasetId, file_path: filePath } = job.data;

  if (!datasetId || !filePath) {
    throw new UnrecoverableError(
      'Job missing required fields: dataset_id, file_path'
    );
  }

  console.info(
    `[job:${job.id}] Starting — dataset=${datasetId} file=${filePath}`
  );

  // Mark as processing
  await Dataset.findByIdAndUpdate(datasetId, { $set: { status: 'processing' } });
  await job.updateProgress(10);

  // Call AI engine
  let results;
  try {
    results = await callAiEngine(datasetId, filePath);
  } catch (err) {
    // Non-retryable: bad request from AI engine (4xx)
    if (err.response && err.response.status >= 400 && err.response.status < 500) {
      await Dataset.findByIdAndUpdate(datasetId, { $set: { status: 'failed' } });
      throw new UnrecoverableError(
        `AI engine rejected request (${err.response.status}): ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw err; // retryable (5xx / network error)
  }

  await job.updateProgress(60);
  console.info(
    `[job:${job.id}] AI engine returned — ` +
      `${(results.insights || []).length} insights, ` +
      `${(results.alerts || []).length} alerts`
  );

  // Persist to MongoDB
  await persistResults(datasetId, results, job);
  await job.updateProgress(100);

  console.info(`[job:${job.id}] Completed successfully`);
  return { datasetId, insightCount: (results.insights || []).length, alertCount: (results.alerts || []).length };
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
async function main() {
  await connectMongo();

  const redisConnection = createRedisConnection();

  const worker = new Worker(QUEUE_NAME, processJob, {
    connection: redisConnection,
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 2,
    settings: {
      backoffStrategy: (attemptsMade) =>
        Math.min(attemptsMade * RETRY_DELAY_MS, 30000),
    },
    defaultJobOptions: {
      attempts: MAX_JOB_RETRIES,
      backoff: { type: 'exponential', delay: RETRY_DELAY_MS },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 100 },
    },
  });

  worker.on('active', (job) =>
    console.info(`[worker] Job ${job.id} is now active`)
  );

  worker.on('progress', (job, progress) =>
    console.info(`[worker] Job ${job.id} progress: ${progress}%`)
  );

  worker.on('completed', (job, result) =>
    console.info(
      `[worker] Job ${job.id} completed — ` +
        `insights=${result.insightCount} alerts=${result.alertCount}`
    )
  );

  worker.on('failed', async (job, err) => {
    const attempts = job ? job.attemptsMade : '?';
    console.error(
      `[worker] Job ${job && job.id} failed (attempt ${attempts}): ${err.message}`
    );

    // On final failure, make sure the dataset is marked failed
    if (job && (job.attemptsMade >= MAX_JOB_RETRIES || err instanceof UnrecoverableError)) {
      try {
        await Dataset.findByIdAndUpdate(job.data.dataset_id, {
          $set: { status: 'failed' },
        });
        console.warn(
          `[worker] Dataset ${job.data.dataset_id} marked as failed`
        );
      } catch (mongoErr) {
        console.error('[worker] Could not update dataset status:', mongoErr.message);
      }
    }
  });

  worker.on('error', (err) =>
    console.error('[worker] Worker error:', err.message)
  );

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.info(`[worker] Received ${signal}, shutting down gracefully…`);
    await worker.close();
    await mongoose.connection.close();
    await redisConnection.quit();
    console.info('[worker] Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  console.info(
    `[worker] Listening on queue "${QUEUE_NAME}" ` +
      `(concurrency=${worker.opts.concurrency})`
  );
}

main().catch((err) => {
  console.error('[worker] Fatal startup error:', err);
  process.exit(1);
});
