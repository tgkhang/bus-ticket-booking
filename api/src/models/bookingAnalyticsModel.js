import { GET_DB } from '../config/prisma'

const countBookings = async ({ from, to, status }) => {
  const prisma = GET_DB();
  return prisma.booking.count({
    where: {
      ...(status ? { status: Array.isArray(status) ? { in: status } : status } : {}),
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
  });
};

const findBookings = async ({ from, to, status, select }) => {
  const prisma = GET_DB();
  return prisma.booking.findMany({
    where: {
      ...(status ? { status: Array.isArray(status) ? { in: status } : status } : {}),
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
    select,
  });
};

const findBookingsWithTrip = async ({ from, to, status }) => {
  const prisma = GET_DB();
  return prisma.booking.findMany({
    where: {
      ...(status ? { status: Array.isArray(status) ? { in: status } : status } : {}),
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
    select: {
      trip: { select: { route: { select: { name: true } } } },
    },
  });
};

const findTripsWithBookings = async ({ from, to }) => {
  const prisma = GET_DB();
  return prisma.trip.findMany({
    where: {
      departureTime: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
    include: {
      bus: true,
      bookings: {
        where: { status: { in: ["confirmed", "completed"] } },
        include: { passengerDetails: true },
      },
    },
  });
};


const getConversionFunnelCounts = async ({ from, to }) => {
  const prisma = GET_DB();
  const initiated = await prisma.booking.count({
    where: {
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
  });
  const confirmed = await prisma.booking.count({
    where: {
      status: 'confirmed',
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
  });
  const completed = await prisma.booking.count({
    where: {
      status: 'completed',
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
  });
  return { initiated, confirmed, completed };
};

export const bookingAnalyticsModel = {
  countBookings,
  findBookings,
  findBookingsWithTrip,
  getConversionFunnelCounts,
};

export const tripAnalyticsModel = {
  findTripsWithBookings,
};
