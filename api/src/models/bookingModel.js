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
          bus: true,
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
            bus: true,
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

export const bookingModel = {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
}
