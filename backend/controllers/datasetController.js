const path = require('path');
const fs = require('fs');
const Dataset = require('../models/Dataset');
const DatasetVersion = require('../models/DatasetVersion');
const Insight = require('../models/Insight');
const Alert = require('../models/Alert');
const { parseCSV } = require('../utils/csvParser');
const { analyzeColumns } = require('../utils/columnTypeDetector');
const { addJob } = require('../services/queueService');
const { success, error } = require('../utils/responseHelper');

const upload = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    const { name, description, tags } = req.body;
    const { filename, originalname, size, path: filePath } = req.file;

    const { rows, headers } = await parseCSV(filePath);
    const columns = analyzeColumns(headers, rows);

    const dataset = await Dataset.create({
      name: name || originalname,
      description: description || '',
      filename,
      originalName: originalname,
      fileSize: size,
      filePath,
      uploadedBy: req.user.id,
      columns,
      rowCount: rows.length,
      status: 'pending',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    });

    await DatasetVersion.create({
      datasetId: dataset._id,
      version: 1,
      snapshot: { columns, rowCount: rows.length },
      uploadedBy: req.user.id,
    });

    await addJob(dataset._id.toString(), filePath);

    return success(res, { dataset }, 'Dataset uploaded successfully', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const list = async (req, res) => {
  try {
    const datasets = await Dataset.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');
    return success(res, { datasets, total: datasets.length });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getById = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      uploadedBy: req.user.id,
    }).select('-__v');

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    const [insights, alerts] = await Promise.all([
      Insight.find({ datasetId: dataset._id, isActive: true }).sort({ score: -1 }).limit(20),
      Alert.find({ datasetId: dataset._id }).sort({ createdAt: -1 }).limit(20),
    ]);

    return success(res, { dataset, insights, alerts });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    await Promise.all([
      Insight.deleteMany({ datasetId: dataset._id }),
      Alert.deleteMany({ datasetId: dataset._id }),
      DatasetVersion.deleteMany({ datasetId: dataset._id }),
      dataset.deleteOne(),
    ]);

    return success(res, null, 'Dataset deleted successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const preview = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    const { rows, headers } = await parseCSV(dataset.filePath);
    const previewRows = rows.slice(0, 100);

    return success(res, { headers, rows: previewRows, total: rows.length });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { upload, list, getById, delete: deleteDataset, preview };
