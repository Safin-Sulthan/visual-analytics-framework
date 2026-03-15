const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'generating', 'ready', 'failed'],
      default: 'pending',
    },
    filePath: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
