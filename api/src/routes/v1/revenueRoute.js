const express = require("express");
const revenueController = require("../../controllers/revenueController");
const router = express.Router();

// GET overview?from=2025-12-01&to=2025-12-07
router.get("/overview", revenueController.getRevenueOverview);

// GET by-route?from=2025-12-01&to=2025-12-07
router.get("/by-route", revenueController.getRevenueByRoute);

// GET payment-method?from=2025-12-01&to=2025-12-07
router.get("/payment-method", revenueController.getRevenueByPaymentMethod);

module.exports = router;
