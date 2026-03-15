const mongoose = require('mongoose');

const insightScoreSchema = new mongoose.Schema(
  {
    statistical:     { type: Number, default: 0 },
    businessImpact:  { type: Number, default: 0 },
    anomalySeverity: { type: Number, default: 0 },
  },
  { _id: false }
);

const insightSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true,
      index: true,
    },
    text:     { type: String, required: true },
    category: {
      type: String,
      enum: ['statistical', 'trend', 'anomaly', 'correlation', 'distribution', 'business'],
      default: 'statistical',
    },
    score:    { type: Number, default: 0 },
    scores:   insightScoreSchema,
    rank:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Composite score: 0.5 * statistical + 0.3 * businessImpact + 0.2 * anomalySeverity
insightSchema.pre('save', function (next) {
  if (this.scores) {
    this.score =
      0.5 * (this.scores.statistical     ?? 0) +
      0.3 * (this.scores.businessImpact  ?? 0) +
      0.2 * (this.scores.anomalySeverity ?? 0);
  }
  next();
});

module.exports = mongoose.model('Insight', insightSchema);
