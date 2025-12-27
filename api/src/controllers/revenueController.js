import {
  getRevenueOverview as getRevenueOverviewService,
  getRevenueByRoute as getRevenueByRouteService,
  getRevenueByPaymentMethod as getRevenueByPaymentMethodService
} from "../services/revenueService";

export const getRevenueOverview = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await getRevenueOverviewService({ from, to });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getRevenueByRoute = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await getRevenueByRouteService({ from, to });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getRevenueByPaymentMethod = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await getRevenueByPaymentMethodService({ from, to });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
