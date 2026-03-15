const mongoose = require('mongoose');

const analyticsResultSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['eda', 'ml', 'insight', 'prediction'],
      required: true,
    },
    result: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsResult', analyticsResultSchema);
