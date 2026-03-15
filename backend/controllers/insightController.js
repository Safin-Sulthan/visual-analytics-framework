const Insight = require('../models/Insight');
const Dataset = require('../models/Dataset');
const { success, error } = require('../utils/responseHelper');
<<<<<<< HEAD

=======
const { getTopInsights } = require('../services/insightRankingService');
>>>>>>> copilot-pr-5

const list = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({
      _id: datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    const { type, limit = 50 } = req.query;
    const filter = { datasetId, isActive: true };
    if (type) filter.type = type;

    const insights = await Insight.find(filter)
      .sort({ score: -1 })
      .limit(parseInt(limit, 10))
      .select('-__v');

    return success(res, { insights, total: insights.length });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getById = async (req, res) => {
  try {
    const insight = await Insight.findById(req.params.id).select('-__v');

    if (!insight) {
      return error(res, 'Insight not found', 404);
    }

    const dataset = await Dataset.findOne({
      _id: insight.datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Access denied', 403);
    }

    return success(res, { insight });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const dismiss = async (req, res) => {
  try {
    const insight = await Insight.findById(req.params.id);

    if (!insight) {
      return error(res, 'Insight not found', 404);
    }

    const dataset = await Dataset.findOne({
      _id: insight.datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Access denied', 403);
    }

    insight.isActive = false;
    await insight.save();

    return success(res, { insight }, 'Insight dismissed');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

<<<<<<< HEAD
module.exports = { list, getById, dismiss };
=======
const getTop = async (req, res) => {
  try {
    const { datasetId } = req.query;
    const limit = parseInt(req.query.limit, 10) || 5;

    if (datasetId) {
      const dataset = await Dataset.findOne({
        _id: datasetId,
        uploadedBy: req.user.id,
      });
      if (!dataset) {
        return error(res, 'Dataset not found', 404);
      }
    }

    const insights = await getTopInsights(datasetId || null, limit);
    return success(res, { insights, total: insights.length });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, getById, dismiss, getTop };
>>>>>>> copilot-pr-5
