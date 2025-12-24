const { bookingAnalyticsModel, tripAnalyticsModel } = require('../models/bookingAnalyticsModel')

const getTotalBookings = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) return 0;
  return bookingAnalyticsModel.countBookings({ from, to });
};

const getConversionRate = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) return 0;
  const totalBookings = await bookingAnalyticsModel.countBookings({ from, to });
  const confirmedBookings = await bookingAnalyticsModel.countBookings({ from, to, status: ["confirmed", "completed"] });
  return totalBookings ? (confirmedBookings / totalBookings) * 100 : 0;
};

const getPopularRoutes = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) return [];
  const bookings = await bookingAnalyticsModel.findBookingsWithTrip({ from, to, status: ["confirmed", "completed"] });
  const routeCount = {};
  bookings.forEach(b => {
    const route = b.trip?.route?.name || "Unknown";
    routeCount[route] = (routeCount[route] || 0) + 1;
  });
  return Object.entries(routeCount)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

const getPeakTimes = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) return [];
  const bookings = await bookingAnalyticsModel.findBookings({ from, to, status: ["confirmed", "completed"], select: { bookedAt: true } });
  const timeSlots = {};
  bookings.forEach(b => {
    const hour = b.bookedAt.getHours();
    const date = b.bookedAt.toISOString().slice(0, 10);
    const key = `${date}-${hour}`;
    timeSlots[key] = (timeSlots[key] || 0) + 1;
  });
  const start = new Date(from);
  const end = new Date(to);
  const allDates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDates.push(d.toISOString().slice(0, 10));
  }
  const result = [];
  for (const date of allDates) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${date}-${hour}`;
      result.push({ date, hour, count: timeSlots[key] || 0 });
    }
  }
  return result;
};

const getBookingPatterns = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) return [];
  const bookings = await bookingAnalyticsModel.findBookings({ from, to, status: ["confirmed", "completed"], select: { bookedAt: true } });
  const patterns = {};
  bookings.forEach(b => {
    const dayOfWeek = b.bookedAt.getDay();
    const hour = b.bookedAt.getHours();
    const key = `${dayOfWeek}-${hour}`;
    patterns[key] = (patterns[key] || 0) + 1;
  });
  return Object.entries(patterns).map(([key, count]) => {
    const [day, hour] = key.split('-');
    return { dayOfWeek: parseInt(day), hour: parseInt(hour), count };
  });
};

const getSeatOccupancy = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) return 0;
  const trips = await tripAnalyticsModel.findTripsWithBookings({ from, to });
  let totalSeats = 0;
  let occupiedSeats = 0;
  trips.forEach(trip => {
    const busCapacity = trip.bus?.seatCapacity || 0;
    totalSeats += busCapacity;
    occupiedSeats += trip.bookings.reduce((sum, booking) => sum + booking.passengerDetails.length, 0);
  });
  return totalSeats ? (occupiedSeats / totalSeats) * 100 : 0;
};

const getConversionFunnel = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) {
    return { initiated: 0, confirmed: 0, completed: 0 };
  }
  return bookingAnalyticsModel.getConversionFunnelCounts({ from, to });
};

module.exports = {
  getTotalBookings,
  getConversionRate,
  getPopularRoutes,
  getPeakTimes,
  getBookingPatterns,
  getSeatOccupancy,
  getConversionFunnel,
};