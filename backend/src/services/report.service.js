const PDFDocument      = require('pdfkit');
const fs               = require('fs');
const path             = require('path');
const AnalyticsResult  = require('../models/AnalyticsResult');
const Insight          = require('../models/Insight');

const REPORTS_DIR = path.join(__dirname, '..', '..', 'uploads', 'reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const generatePDFReport = async (datasetId) => {
  const [edaResult, mlResult, insights] = await Promise.all([
    AnalyticsResult.findOne({ datasetId, type: 'eda' }),
    AnalyticsResult.findOne({ datasetId, type: 'ml'  }),
    Insight.find({ datasetId }).sort({ score: -1 }).limit(10),
  ]);

  const content = {
    eda:      edaResult?.result || {},
    ml:       mlResult?.result  || {},
    insights: insights.map((i) => ({ text: i.text, category: i.category, score: i.score })),
  };

  const filePath = path.join(REPORTS_DIR, `report-${datasetId}-${Date.now()}.pdf`);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(22).text('Visual Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Dataset ID: ${datasetId}`, { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // EDA Summary
    if (content.eda.statistics) {
      doc.fontSize(15).text('Exploratory Data Analysis', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(JSON.stringify(content.eda.statistics, null, 2));
      doc.moveDown();
    }

    // Insights
    if (content.insights.length) {
      doc.fontSize(15).text('Top Insights', { underline: true });
      doc.moveDown(0.5);
      content.insights.forEach((insight, i) => {
        doc.fontSize(10).text(`${i + 1}. [${insight.category}] ${insight.text}`);
        doc.fontSize(9).text(`   Score: ${(insight.score ?? 0).toFixed(4)}`);
        doc.moveDown(0.3);
      });
    }

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { filePath, content };
};

module.exports = { generatePDFReport };
