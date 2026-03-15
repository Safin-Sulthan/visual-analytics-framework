const { Queue, Worker } = require('bullmq');
const path = require('path');
const { redisConfig } = require('../config/redis');
const Report = require('../models/Report');
const { generateReport } = require('../services/aiService');

const QUEUE_NAME = 'report-generation';

const reportQueue = new Queue(QUEUE_NAME, { connection: redisConfig });

const reportWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { reportId, datasetId, options } = job.data;

    await Report.findByIdAndUpdate(reportId, { status: 'generating' });
    job.log(`Generating report ${reportId} for dataset ${datasetId}`);

    const { data: result } = await generateReport(datasetId, options);

    const filePath = result.file_path || path.join('uploads', `report_${reportId}.pdf`);

    await Report.findByIdAndUpdate(reportId, {
      status: 'ready',
      filePath,
    });

    job.log(`Report ${reportId} generated at ${filePath}`);
    return { reportId, filePath };
  },
  { connection: redisConfig, concurrency: 2 }
);

reportWorker.on('completed', (job) =>
  console.info(`[reportQueue] Job ${job.id} completed`)
);

reportWorker.on('failed', async (job, err) => {
  console.error(`[reportQueue] Job ${job?.id} failed: ${err.message}`);
  if (job?.data?.reportId) {
    await Report.findByIdAndUpdate(job.data.reportId, {
      status: 'failed',
      errorMessage: err.message,
    }).catch(() => {});
  }
});

module.exports = { reportQueue, reportWorker };
