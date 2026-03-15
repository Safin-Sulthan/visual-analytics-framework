const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const AnalyticsResult = require('../models/AnalyticsResult');
const Dataset         = require('../models/Dataset');
const analyticsService = require('./analytics.service');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const analyticsQueue = new Queue('analytics', { connection });
const reportQueue    = new Queue('reports',   { connection });

// Worker: process analytics jobs
new Worker(
  'analytics',
  async (job) => {
    const { datasetId } = job.data;
    console.log(`[Queue] Processing analytics for dataset ${datasetId}`);

    try {
      await Dataset.findByIdAndUpdate(datasetId, { status: 'processing' });

      const dataset = await Dataset.findById(datasetId);
      if (!dataset) throw new Error('Dataset not found');

      const result = await analyticsService.requestAnalysis(datasetId, dataset.filePath);

      await AnalyticsResult.findOneAndUpdate(
        { datasetId, type: 'eda' },
        { result: result.eda },
        { upsert: true, new: true }
      );
      await AnalyticsResult.findOneAndUpdate(
        { datasetId, type: 'ml' },
        { result: result.ml },
        { upsert: true, new: true }
      );

      await Dataset.findByIdAndUpdate(datasetId, { status: 'completed' });
      console.log(`[Queue] Analytics completed for dataset ${datasetId}`);
    } catch (err) {
      console.error(`[Queue] Analytics failed for dataset ${datasetId}:`, err.message);
      await Dataset.findByIdAndUpdate(datasetId, { status: 'failed' });
    }
  },
  { connection }
);

const addAnalyticsJob = (datasetId) =>
  analyticsQueue.add('analyse', { datasetId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });

const addReportJob = (datasetId, userId) =>
  reportQueue.add('generate', { datasetId, userId }, { attempts: 2 });

module.exports = { addAnalyticsJob, addReportJob };
