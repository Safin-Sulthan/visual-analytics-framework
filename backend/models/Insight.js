const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['eda', 'anomaly', 'cluster', 'prediction', 'correlation', 'trend'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  score: {
    type: Number,
    default: 0,
  },
  statisticalSignificance: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  businessImpact: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  anomalySeverity: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  chartConfig: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Insight', insightSchema);
