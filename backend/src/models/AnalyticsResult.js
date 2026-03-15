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
      enum: ['eda', 'temporal', 'prediction', 'anomaly', 'nlp'],
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

analyticsResultSchema.index({ datasetId: 1, type: 1 });

module.exports = mongoose.model('AnalyticsResult', analyticsResultSchema);
