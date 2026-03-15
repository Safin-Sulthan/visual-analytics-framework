import datasetQueue from '../queues/datasetQueue.js';

export const JOB_TYPES = {
  PROCESS_DATASET: 'process-dataset',
};

/**
 * Add a dataset processing job to the queue.
 * @param {{ datasetId: string, filePath: string, userId: string }} data
 */
export async function addDatasetJob(data) {
  return datasetQueue.add(JOB_TYPES.PROCESS_DATASET, data);
}
