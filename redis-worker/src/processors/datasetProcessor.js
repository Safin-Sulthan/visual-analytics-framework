import 'dotenv/config';
import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

function log(jobId, step, message) {
  console.log(`[${new Date().toISOString()}] [dataset-processor] [job:${jobId}] [${step}] ${message}`);
}

async function updateDatasetStatus(datasetId, status, jobId) {
  try {
    await axios.put(`${BACKEND_URL}/api/datasets/${datasetId}/status`, { status });
    log(jobId, 'status-update', `Dataset ${datasetId} status set to '${status}'`);
  } catch (err) {
    log(jobId, 'status-update-error', `Failed to update dataset status: ${err.message}`);
  }
}

export async function processDataset(job) {
  const { datasetId, filePath, userId } = job.data;
  const jobId = job.id;

  log(jobId, 'start', `Processing dataset ${datasetId} for user ${userId}`);

  try {
    // Step 1: Run EDA on the dataset via ai-engine
    log(jobId, 'eda', `Calling ai-engine EDA for file ${filePath}`);
    const edaResponse = await axios.post(`${AI_ENGINE_URL}/api/v1/eda`, {
      file_path: filePath,
      dataset_id: datasetId,
    });
    const edaResult = edaResponse.data;
    log(jobId, 'eda', 'EDA completed successfully');

    // Step 2: Generate insights from EDA result via ai-engine
    log(jobId, 'insights', 'Calling ai-engine for insights');
    const insightsResponse = await axios.post(`${AI_ENGINE_URL}/api/v1/insights`, {
      eda_result: edaResult,
    });
    const insights = insightsResponse.data;
    log(jobId, 'insights', 'Insights generated successfully');

    // Step 3: Update dataset status to 'completed' in MongoDB via backend
    await updateDatasetStatus(datasetId, 'completed', jobId);

    // Step 4: Persist insights via backend bulk endpoint
    log(jobId, 'save-insights', `Saving insights for dataset ${datasetId}`);
    await axios.post(`${BACKEND_URL}/api/insights/bulk/${datasetId}`, { insights, userId });
    log(jobId, 'save-insights', 'Insights saved successfully');

    log(jobId, 'done', `Dataset ${datasetId} processed successfully`);
    return { datasetId, status: 'completed' };
  } catch (err) {
    log(jobId, 'error', `Processing failed: ${err.message}`);
    await updateDatasetStatus(datasetId, 'failed', jobId);
    throw err;
  }
}
