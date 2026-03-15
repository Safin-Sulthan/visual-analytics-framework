const { body } = require('express-validator');
const Dataset = require('../models/Dataset');
const AnalyticsResult = require('../models/AnalyticsResult');
const { runNLPQuery } = require('../services/aiService');
const { success, notFound, badRequest, error } = require('../utils/apiResponse');

const nlpQueryValidation = [
  body('query').trim().notEmpty().withMessage('Query is required'),
  body('datasetId').notEmpty().withMessage('datasetId is required'),
];

const query = async (req, res) => {
  try {
    const { query: nlpQuery, datasetId, context } = req.body;

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user.id });
    if (!dataset) return notFound(res, 'Dataset not found');

    const { data: nlpResult } = await runNLPQuery(datasetId, nlpQuery, context || {});

    const historyEntry = await AnalyticsResult.create({
      datasetId,
      type: 'nlp',
      result: { query: nlpQuery, response: nlpResult, timestamp: new Date() },
    });

    return success(res, historyEntry);
  } catch (err) {
    console.error('[nlpController.query]', err);
    return error(res, err.message, err.status || 500);
  }
};

const getNLPHistory = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.datasetId,
      userId: req.user.id,
    });
    if (!dataset) return notFound(res, 'Dataset not found');

    const history = await AnalyticsResult.find({
      datasetId: req.params.datasetId,
      type: 'nlp',
    }).sort({ createdAt: -1 });

    return success(res, history);
  } catch (err) {
    console.error('[nlpController.getNLPHistory]', err);
    return error(res, err.message);
  }
};

module.exports = { query, getNLPHistory, nlpQueryValidation };
