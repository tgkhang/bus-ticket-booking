import { bookingModel } from "../models/bookingModel";

export const getRevenueOverview = async ({ from, to }) => {
  return await bookingModel.getRevenueOverview(from, to);
};

export const getRevenueByRoute = async ({ from, to }) => {
  return await bookingModel.getRevenueByRoute(from, to);
};

export const getRevenueByPaymentMethod = async ({ from, to }) => {
  return await bookingModel.getRevenueByPaymentMethod(from, to);
};
