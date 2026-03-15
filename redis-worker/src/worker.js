import 'dotenv/config';
import { Worker } from 'bullmq';
import { redisConnection } from './config/redis.js';
import { processDataset } from './processors/datasetProcessor.js';
import { processReport } from './processors/reportProcessor.js';

function ts() {
  return new Date().toISOString();
}

function log(label, message) {
  console.log(`[${ts()}] [${label}] ${message}`);
}

// Dataset worker
const datasetWorker = new Worker('dataset-processing', processDataset, {
  connection: redisConnection,
});

datasetWorker.on('completed', (job) => {
  log('dataset-worker', `Job ${job.id} completed`);
});

datasetWorker.on('failed', (job, err) => {
  log('dataset-worker', `Job ${job?.id} failed: ${err.message}`);
});

datasetWorker.on('error', (err) => {
  log('dataset-worker', `Worker error: ${err.message}`);
});

datasetWorker.on('stalled', (jobId) => {
  log('dataset-worker', `Job ${jobId} stalled`);
});

// Report worker
const reportWorker = new Worker('report-generation', processReport, {
  connection: redisConnection,
});

reportWorker.on('completed', (job) => {
  log('report-worker', `Job ${job.id} completed`);
});

reportWorker.on('failed', (job, err) => {
  log('report-worker', `Job ${job?.id} failed: ${err.message}`);
});

reportWorker.on('error', (err) => {
  log('report-worker', `Worker error: ${err.message}`);
});

reportWorker.on('stalled', (jobId) => {
  log('report-worker', `Job ${jobId} stalled`);
});

log('main', 'Redis workers started — listening on dataset-processing and report-generation queues');

// Graceful shutdown
async function shutdown(signal) {
  log('main', `Received ${signal}, shutting down gracefully…`);
  await Promise.all([datasetWorker.close(), reportWorker.close()]);
  log('main', 'All workers closed. Exiting.');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
