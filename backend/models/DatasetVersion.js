const mongoose = require('mongoose');

const datasetVersionSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true,
  },
  version: {
    type: Number,
    required: true,
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  snapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

datasetVersionSchema.index({ datasetId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('DatasetVersion', datasetVersionSchema);
