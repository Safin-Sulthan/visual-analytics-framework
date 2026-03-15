const fs      = require('fs');
const path    = require('path');
const csv     = require('csv-parse/sync');
const Dataset = require('../models/Dataset');
const { addAnalyticsJob } = require('../services/queue.service');

const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const content = fs.readFileSync(req.file.path, 'utf8');
    const records = csv.parse(content, { columns: true, skip_empty_lines: true, trim: true });
    const columns = records.length
      ? Object.keys(records[0]).map((name) => ({ name, type: 'text' }))
      : [];

    const dataset = await Dataset.create({
      userId:      req.user._id,
      name:        path.parse(req.file.originalname).name,
      filename:    req.file.originalname,
      filePath:    req.file.path,
      rowCount:    records.length,
      columnCount: columns.length,
      columns,
      status:      'pending',
    });

    // Queue background analysis
    await addAnalyticsJob(dataset._id.toString());

    return res.status(201).json(dataset);
  } catch (err) {
    next(err);
  }
};

const getDatasets = async (req, res, next) => {
  try {
    const datasets = await Dataset.find({ userId: req.user._id }).sort({ uploadedAt: -1 });
    res.json(datasets);
  } catch (err) {
    next(err);
  }
};

const getDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });
    res.json(dataset);
  } catch (err) {
    next(err);
  }
};

const deleteDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    // Remove the uploaded file
    if (fs.existsSync(dataset.filePath)) fs.unlinkSync(dataset.filePath);

    res.json({ message: 'Dataset deleted' });
  } catch (err) {
    next(err);
  }
};

const getDatasetPreview = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const content = fs.readFileSync(dataset.filePath, 'utf8');
    const records = csv.parse(content, { columns: true, skip_empty_lines: true, trim: true });
    const preview = records.slice(0, 20);

    res.json({
      columns:      dataset.columns,
      rows:         preview,
      totalRows:    dataset.rowCount,
      totalColumns: dataset.columnCount,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDataset, getDatasets, getDataset, deleteDataset, getDatasetPreview };
