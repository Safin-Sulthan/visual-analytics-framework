const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const { datasetQueue } = require('../queues/datasetQueue');
const { success, created, notFound, forbidden, error } = require('../utils/apiResponse');

const uploadDataset = async (req, res) => {
  try {
    if (!req.file) return error(res, 'No file uploaded', 400);

    const dataset = await Dataset.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      status: 'pending',
    });

    await datasetQueue.add('process-dataset', {
      datasetId: dataset._id.toString(),
      filePath: req.file.path,
    });

    return created(res, dataset, 'Dataset uploaded and queued for processing');
  } catch (err) {
    console.error('[datasetController.uploadDataset]', err);
    return error(res, err.message);
  }
};

const listDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return success(res, datasets);
  } catch (err) {
    console.error('[datasetController.listDatasets]', err);
    return error(res, err.message);
  }
};

const getDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);
    return success(res, dataset);
  } catch (err) {
    console.error('[datasetController.getDataset]', err);
    return error(res, err.message);
  }
};

const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return notFound(res, 'Dataset not found');
    if (dataset.userId.toString() !== req.user.id) return forbidden(res);

    if (dataset.path && fs.existsSync(dataset.path)) {
      fs.unlinkSync(dataset.path);
    }

    await dataset.deleteOne();
    return success(res, null, 'Dataset deleted successfully');
  } catch (err) {
    console.error('[datasetController.deleteDataset]', err);
    return error(res, err.message);
  }
};

module.exports = { uploadDataset, listDatasets, getDataset, deleteDataset };
