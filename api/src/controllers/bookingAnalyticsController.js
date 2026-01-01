import {
  getTotalBookings as getTotalBookingsService,
  getConversionRate as getConversionRateService,
  getSeatOccupancy as getSeatOccupancyService,
  getPopularRoutes as getPopularRoutesService,
  getPeakTimes as getPeakTimesService,
  getConversionFunnel as getConversionFunnelService
} from '~/services/bookingAnalyticsService'

export const getBookingAnalytics = async (req, res, next) => {
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
      getTotalBookingsService(from, to),
      getConversionRateService(from, to),
      getSeatOccupancyService(from, to),
      getPopularRoutesService(from, to),
      getPeakTimesService(from, to),
      getConversionFunnelService(from, to),
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