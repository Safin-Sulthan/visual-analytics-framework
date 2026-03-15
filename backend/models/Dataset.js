const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['numeric', 'categorical', 'datetime', 'boolean', 'unknown'] },
    nullable: { type: Boolean, default: false },
  },
  { _id: false }
);

const datasetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dataset name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    columns: [columnSchema],
    rowCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dataset', datasetSchema);
