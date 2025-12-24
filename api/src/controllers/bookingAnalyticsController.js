const bookingAnalyticsService = require("~/services/bookingAnalyticsService");

exports.getBookingAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    // Gather all analytics data in parallel
    const [
      totalBookings,
      conversionRate,
      seatOccupancy,
      popularRoutes,
      peakTimes,
      funnel
    ] = await Promise.all([
      bookingAnalyticsService.getTotalBookings(from, to),
      bookingAnalyticsService.getConversionRate(from, to),
      bookingAnalyticsService.getSeatOccupancy(from, to),
      bookingAnalyticsService.getPopularRoutes(from, to),
      bookingAnalyticsService.getPeakTimes(from, to),
      bookingAnalyticsService.getConversionFunnel(from, to),
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        conversionRate,
        seatOccupancy,
        popularRoutes,
        peakTimes,
        funnel,
      },
    });
  } catch (err) {
    next(err);
  }
};