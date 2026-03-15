const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const reportsDir = path.join(__dirname, '..', 'reports');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const buildHTML = (dataset, insights, alerts) => {
  const insightRows = insights
    .map(
      (i) => `
      <tr>
        <td>${escapeHtml(i.title)}</td>
        <td>${escapeHtml(i.type)}</td>
        <td>${(i.score || 0).toFixed(2)}</td>
        <td>${escapeHtml(i.description || '')}</td>
      </tr>`
    )
    .join('');

  const alertRows = alerts
    .map(
      (a) => `
      <tr class="severity-${a.severity}">
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.type)}</td>
        <td>${escapeHtml(a.severity)}</td>
        <td>${escapeHtml(a.description || '')}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(dataset.name)} - Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #1a237e; }
    h2 { color: #283593; border-bottom: 2px solid #3949ab; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #3949ab; color: #fff; padding: 10px; text-align: left; }
    td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) { background: #f5f5f5; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
    .meta div { background: #e8eaf6; padding: 10px; border-radius: 4px; }
    .severity-critical td { color: #b71c1c; }
    .severity-high td { color: #e53935; }
    .severity-medium td { color: #f57c00; }
    .severity-low td { color: #388e3c; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <h1>${escapeHtml(dataset.name)} — Analytics Report</h1>
  <div class="meta">
    <div><strong>Rows:</strong> ${dataset.rowCount}</div>
    <div><strong>Columns:</strong> ${dataset.columns.length}</div>
    <div><strong>Status:</strong> ${escapeHtml(dataset.status)}</div>
    <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
  </div>

  <h2>Top Insights (${insights.length})</h2>
  <table>
    <thead><tr><th>Title</th><th>Type</th><th>Score</th><th>Description</th></tr></thead>
    <tbody>${insightRows || '<tr><td colspan="4">No insights available</td></tr>'}</tbody>
  </table>

  <h2>Alerts (${alerts.length})</h2>
  <table>
    <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Description</th></tr></thead>
    <tbody>${alertRows || '<tr><td colspan="4">No alerts</td></tr>'}</tbody>
  </table>

  <div class="footer">Visual Analytics Framework &mdash; ${new Date().getFullYear()}</div>
</body>
</html>`;
};

const escapeHtml = (str) => {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const generatePDF = async (dataset, insights, alerts) => {
  const html = buildHTML(dataset, insights, alerts);
  const fileName = `report-${dataset._id}-${Date.now()}.pdf`;
  const outputPath = path.join(reportsDir, fileName);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPath, format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  } finally {
    await browser.close();
  }

  return outputPath;
};

module.exports = { generatePDF };
