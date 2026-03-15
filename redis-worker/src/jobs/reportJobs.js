import reportQueue from '../queues/reportQueue.js';

export const JOB_TYPES = {
  GENERATE_REPORT: 'generate-report',
};

/**
 * Add a report generation job to the queue.
 * @param {{ reportId: string, datasetId: string, userId: string, outputPath: string }} data
 */
export async function addReportJob(data) {
  return reportQueue.add(JOB_TYPES.GENERATE_REPORT, data);
}
