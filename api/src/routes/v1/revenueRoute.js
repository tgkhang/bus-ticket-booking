import express from "express";
import { getRevenueOverview, getRevenueByRoute, getRevenueByPaymentMethod } from "../../controllers/revenueController";
const router = express.Router();

// GET overview?from=2025-12-01&to=2025-12-07
router.get("/overview", getRevenueOverview);

// GET by-route?from=2025-12-01&to=2025-12-07
router.get("/by-route", getRevenueByRoute);

// GET payment-method?from=2025-12-01&to=2025-12-07
router.get("/payment-method", getRevenueByPaymentMethod);

export default router;
