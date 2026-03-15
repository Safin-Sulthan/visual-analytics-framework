const { Queue, Worker } = require('bullmq');
const { redisConfig } = require('../config/redis');
const Dataset = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const { runEDA } = require('../services/aiService');
const { parseCSVMeta } = require('../services/csvParser');

const QUEUE_NAME = 'dataset-processing';

const datasetQueue = new Queue(QUEUE_NAME, { connection: redisConfig });

const datasetWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { datasetId, filePath } = job.data;

    await Dataset.findByIdAndUpdate(datasetId, { status: 'processing' });
    job.log(`Processing dataset ${datasetId}`);

    const meta = await parseCSVMeta(filePath);
    await Dataset.findByIdAndUpdate(datasetId, {
      columns: meta.columns,
      rowCount: meta.rowCount,
    });

    const { data: edaResult } = await runEDA(datasetId, filePath);

    await AnalyticsResult.findOneAndUpdate(
      { datasetId, type: 'eda' },
      { datasetId, type: 'eda', result: edaResult },
      { upsert: true, new: true }
    );

    await Dataset.findByIdAndUpdate(datasetId, { status: 'ready' });
    job.log(`Dataset ${datasetId} processed successfully`);

    return { datasetId, rowCount: meta.rowCount, columns: meta.columns.length };
  },
  { connection: redisConfig, concurrency: 3 }
);

datasetWorker.on('completed', (job) =>
  console.info(`[datasetQueue] Job ${job.id} completed`)
);

datasetWorker.on('failed', async (job, err) => {
  console.error(`[datasetQueue] Job ${job?.id} failed: ${err.message}`);
  if (job?.data?.datasetId) {
    await Dataset.findByIdAndUpdate(job.data.datasetId, {
      status: 'failed',
      errorMessage: err.message,
    }).catch(() => {});
  }
});

module.exports = { datasetQueue, datasetWorker };
