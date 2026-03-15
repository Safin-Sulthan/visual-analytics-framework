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
      index: true,
    },
    title:    { type: String, required: true },
    content:  { type: mongoose.Schema.Types.Mixed, default: {} },
    filePath: { type: String, default: null },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
