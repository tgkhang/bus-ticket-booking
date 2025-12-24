const express = require('express');
const bookingAnalyticsController = require('~/controllers/bookingAnalyticsController');

const router = express.Router();

router.get('/bookings', bookingAnalyticsController.getBookingAnalytics);

module.exports = router;