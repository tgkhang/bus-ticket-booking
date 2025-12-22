const { bookingModel } = require("../models/bookingModel");

exports.getRevenueOverview = async ({ from, to }) => {
  return await bookingModel.getRevenueOverview(from, to);
};

exports.getRevenueByRoute = async ({ from, to }) => {
  return await bookingModel.getRevenueByRoute(from, to);
};

exports.getRevenueByPaymentMethod = async ({ from, to }) => {
  return await bookingModel.getRevenueByPaymentMethod(from, to);
};
