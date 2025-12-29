import { GET_DB } from '~/config/prisma'

const createBooking = async (bookingData) => {
  const prisma = GET_DB()
  return prisma.booking.create({
    data: bookingData,
    include: {
      trip: {
        include: {
          route: {
            include: {
              originStop: true,
              destinationStop: true,
            },
          },
          bus: {
            include: {
              operator: true,
            },
          },
        },
      },
      passengerDetails: true,
    },
  })
}

const getBookingById = async (id) => {
  const prisma = GET_DB()
  return prisma.booking.findUnique({
    where: { id },
    include: {
      trip: {
        include: {
          route: {
            include: {
              originStop: true,
              destinationStop: true,
            },
          },
          bus: {
            include: {
              operator: true,
            },
          },
        },
      },
      passengerDetails: true,
      payments: true,
    },
  })
}

const getBookingByReferenceCode = async (referenceCode) => {
  const prisma = GET_DB()
  return prisma.booking.findUnique({
    where: { referenceCode },
    include: {
      trip: {
        include: {
          route: {
            include: {
              originStop: true,
              destinationStop: true,
            },
          },
          bus: {
            include: {
              operator: true,
            },
          },
        },
      },
      passengerDetails: true,
      payments: true,
    },
  })
}

const getUserBookings = async (userId, filters = {}) => {
  const prisma = GET_DB()
  const where = { userId }
  
  if (filters.status) {
    where.status = filters.status
  }

  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { bookedAt: 'desc' },
      include: {
        trip: {
          include: {
            route: {
              include: {
                originStop: true,
                destinationStop: true,
              },
            },
            bus: {
              include: {
                operator: true,
              },
            },
          },
        },
        passengerDetails: true,
      },
    }),
  ])

  return {
    data: bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getAdminBookings = async (filters = {}) => {
  const prisma = GET_DB()
  const where = {}

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.from || filters.to) {
    const bookedAt = {}
    if (filters.from && !isNaN(new Date(filters.from))) {
      bookedAt.gte = new Date(filters.from)
    }
    if (filters.to && !isNaN(new Date(filters.to))) {
      // include whole day
      bookedAt.lte = new Date(`${filters.to}T23:59:59.999Z`)
    }
    if (Object.keys(bookedAt).length > 0) {
      where.bookedAt = bookedAt
    }
  }

  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { bookedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
          },
        },
        trip: {
          include: {
            route: {
              include: {
                originStop: true,
                destinationStop: true,
              },
            },
            bus: {
              include: {
                operator: true,
              },
            },
          },
        },
        _count: {
          select: {
            passengerDetails: true,
            payments: true,
          },
        },
      },
    }),
  ])

  return {
    data: bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getBookingByIdAdmin = async (id) => {
  const prisma = GET_DB()
  return prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      },
      trip: {
        include: {
          route: {
            include: {
              originStop: true,
              destinationStop: true,
            },
          },
          bus: {
            include: {
              operator: true,
            },
          },
        },
      },
      passengerDetails: true,
      payments: true,
    },
  })
}

const updateBookingStatus = async (id, status) => {
  const prisma = GET_DB()
  return prisma.booking.update({
    where: { id },
    data: { status },
  })
}

const cancelBooking = async (id) => {
  const prisma = GET_DB()
  return prisma.booking.update({
    where: { id },
    data: { status: 'cancelled' },
  })
}

// Tổng doanh thu, số đơn, giá trị trung bình, khách hàng duy nhất, revenue theo ngày
const getRevenueOverview = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) {
    return { totalRevenue: 0, avgTransaction: 0, totalOrders: 0, uniqueCustomers: 0, revenueOverTime: [] };
  }
  const prisma = GET_DB();
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "completed"] },
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
    select: {
      totalAmount: true,
      userId: true,
      bookedAt: true,
    },
  });
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const totalOrders = bookings.length;
  const avgTransaction = totalOrders ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = new Set(bookings.map(b => b.userId)).size;
  // Revenue theo ngày
  const revenueByDate = {};
  bookings.forEach(b => {
    const d = b.bookedAt.toISOString().slice(0, 10);
    revenueByDate[d] = (revenueByDate[d] || 0) + Number(b.totalAmount);
  });
  const revenueOverTime = Object.entries(revenueByDate).map(([date, revenue]) => ({ date, revenue }));
  return { totalRevenue, avgTransaction, totalOrders, uniqueCustomers, revenueOverTime };
};

// Doanh thu theo tuyến
const getRevenueByRoute = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) {
    return [];
  }
  const prisma = GET_DB();
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "completed"] },
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
    select: {
      totalAmount: true,
      trip: { select: { route: { select: { name: true } } } },
    },
  });
  const revenueByRoute = {};
  bookings.forEach(b => {
    const route = b.trip?.route?.name || "Unknown";
    revenueByRoute[route] = (revenueByRoute[route] || 0) + Number(b.totalAmount);
  });
  return Object.entries(revenueByRoute).map(([route, revenue]) => ({ route, revenue }));
};

// Doanh thu theo phương thức thanh toán
const getRevenueByPaymentMethod = async (from, to) => {
  if (!from || !to || isNaN(new Date(from)) || isNaN(new Date(to))) {
    return [];
  }
  const prisma = GET_DB();
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "completed"] },
      bookedAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    },
    select: {
      totalAmount: true,
      payments: { select: { provider: true } },
    },
  });
  const revenueByMethod = {};
  bookings.forEach(b => {
    const method = b.payments[0]?.provider || "Unknown";
    revenueByMethod[method] = (revenueByMethod[method] || 0) + Number(b.totalAmount);
  });
  return Object.entries(revenueByMethod).map(([method, revenue]) => ({ method, revenue }));
};

export const bookingModel = {
  createBooking,
  getBookingById,
  getBookingByReferenceCode,
  getBookingByIdAdmin,
  getUserBookings,
  getAdminBookings,
  updateBookingStatus,
  cancelBooking,
  getRevenueOverview,
  getRevenueByRoute,
  getRevenueByPaymentMethod,
}
