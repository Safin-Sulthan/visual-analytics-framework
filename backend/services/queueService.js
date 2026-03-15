const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const { sendToAIEngine, processResults } = require('./analyticsService');
const Dataset = require('../models/Dataset');

const analyticsQueue = new Queue('analytics', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

const worker = new Worker(
  'analytics',
  async (job) => {
    const { datasetId, filePath } = job.data;

    await Dataset.findByIdAndUpdate(datasetId, { status: 'processing' });

    try {
      const results = await sendToAIEngine(filePath, datasetId);
      await processResults(datasetId, results);
    } catch (err) {
      await Dataset.findByIdAndUpdate(datasetId, { status: 'failed' });
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`Analytics job ${job.id} completed for dataset ${job.data.datasetId}`);
});

worker.on('failed', (job, err) => {
  console.error(`Analytics job ${job?.id} failed: ${err.message}`);
});

const addJob = async (datasetId, filePath) => {
  const job = await analyticsQueue.add('process-dataset', { datasetId, filePath });
  return job;
};

module.exports = { analyticsQueue, addJob };
