const Alert = require('../models/Alert');
const Dataset = require('../models/Dataset');
const { success, error } = require('../utils/responseHelper');

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

    const { severity, type } = req.query;
    const filter = { datasetId };
    if (severity) filter.severity = severity;
    if (type) filter.type = type;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).select('-__v');
    const unreadCount = alerts.filter((a) => !a.isRead).length;

    return success(res, { alerts, total: alerts.length, unreadCount });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const markRead = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return error(res, 'Alert not found', 404);
    }

    const dataset = await Dataset.findOne({
      _id: alert.datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Access denied', 403);
    }

    alert.isRead = true;
    await alert.save();

    return success(res, { alert }, 'Alert marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const markAllRead = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({
      _id: datasetId,
      uploadedBy: req.user.id,
    });

    if (!dataset) {
      return error(res, 'Dataset not found', 404);
    }

    const result = await Alert.updateMany(
      { datasetId, isRead: false },
      { isRead: true }
    );

    return success(res, { updated: result.modifiedCount }, 'All alerts marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, markRead, markAllRead };
