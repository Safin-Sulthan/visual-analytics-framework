const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['numeric', 'categorical', 'datetime', 'text'], default: 'text' },
  },
  { _id: false }
);

const datasetSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, required: true, trim: true },
    filename:    { type: String, required: true },
    filePath:    { type: String, required: true },
    rowCount:    { type: Number, default: 0 },
    columnCount: { type: Number, default: 0 },
    columns:     [columnSchema],
    status:      {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dataset', datasetSchema);
