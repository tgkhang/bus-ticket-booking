const revenueService = require("../services/revenueService");

exports.getRevenueOverview = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await revenueService.getRevenueOverview({ from, to });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueByRoute = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await revenueService.getRevenueByRoute({ from, to });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueByPaymentMethod = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await revenueService.getRevenueByPaymentMethod({ from, to });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
