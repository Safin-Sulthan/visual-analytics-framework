import 'dotenv/config';
import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

function log(jobId, step, message) {
  console.log(`[${new Date().toISOString()}] [report-processor] [job:${jobId}] [${step}] ${message}`);
}

async function updateReportStatus(reportId, status, jobId) {
  try {
    await axios.put(`${BACKEND_URL}/api/reports/${reportId}/status`, { status });
    log(jobId, 'status-update', `Report ${reportId} status set to '${status}'`);
  } catch (err) {
    log(jobId, 'status-update-error', `Failed to update report status: ${err.message}`);
  }
}

export async function processReport(job) {
  const { reportId, datasetId, userId, outputPath } = job.data;
  const jobId = job.id;

  log(jobId, 'start', `Generating report ${reportId} for dataset ${datasetId}, user ${userId}`);

  try {
    // Step 1: Fetch dataset info from backend
    log(jobId, 'fetch-dataset', `Fetching dataset info for ${datasetId}`);
    const datasetResponse = await axios.get(`${BACKEND_URL}/api/datasets/${datasetId}`);
    const dataset = datasetResponse.data;
    log(jobId, 'fetch-dataset', 'Dataset info fetched');

    // Step 2: Fetch EDA results from backend
    log(jobId, 'fetch-eda', `Fetching EDA results for dataset ${datasetId}`);
    const edaResponse = await axios.get(`${BACKEND_URL}/api/eda/${datasetId}`);
    const edaResult = edaResponse.data;
    log(jobId, 'fetch-eda', 'EDA results fetched');

    // Step 3: Fetch insights from backend
    log(jobId, 'fetch-insights', `Fetching insights for dataset ${datasetId}`);
    const insightsResponse = await axios.get(`${BACKEND_URL}/api/insights/${datasetId}`);
    const insights = insightsResponse.data;
    log(jobId, 'fetch-insights', 'Insights fetched');

    // Step 4: Call ai-engine to generate the PDF report
    log(jobId, 'generate-pdf', 'Calling ai-engine report generation endpoint');
    const reportResponse = await axios.post(`${AI_ENGINE_URL}/api/v1/reports`, {
      report_id: reportId,
      dataset,
      eda_result: edaResult,
      insights,
      output_path: outputPath,
      user_id: userId,
    });
    const reportData = reportResponse.data;
    log(jobId, 'generate-pdf', 'PDF report generated successfully');

    // Step 5: Update report status to 'completed' in backend
    await updateReportStatus(reportId, 'completed', jobId);

    log(jobId, 'done', `Report ${reportId} generated successfully`);
    return { reportId, status: 'completed', reportData };
  } catch (err) {
    log(jobId, 'error', `Report generation failed: ${err.message}`);
    await updateReportStatus(reportId, 'failed', jobId);
    throw err;
  }
}
