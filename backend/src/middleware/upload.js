const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { badRequest } = require('../utils/apiResponse');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.csv', '.tsv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) || file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV/TSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const handleUploadError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return badRequest(res, `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit`);
    }
    return badRequest(res, err.message);
  }
  if (err) {
    return badRequest(res, err.message);
  }
  next();
};

module.exports = { upload, handleUploadError };
