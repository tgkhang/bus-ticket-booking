import { StatusCodes } from 'http-status-codes'
import { PrismaClient } from '@prisma/client'
import ApiError from '~/utils/ApiError'

const prisma = new PrismaClient()

// Get staff assigned trips
const getAssignedTrips = async (staffId, filters = {}) => {
  const { status, date } = filters

  const where = {
    staffId,
    ...(status && { status }),
    ...(date && {
      departureTime: {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    }),
  }

  const trips = await prisma.trip.findMany({
    where,
    include: {
      route: {
        include: {
          originStop: true,
          destinationStop: true,
        },
      },
      bus: true,
      bookings: {
        include: {
          passengerDetails: true,
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
    },
    orderBy: {
      departureTime: 'asc',
    },
  })

  return trips
}

// Get trip passengers
const getTripPassengers = async (tripId, staffId) => {
  // Verify staff is assigned to this trip
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      staffId,
    },
  })

  if (!trip) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not assigned to this trip')
  }

  const bookings = await prisma.booking.findMany({
    where: {
      tripId,
      status: {
        in: ['confirmed', 'completed'],
      },
    },
    include: {
      passengerDetails: true,
      user: {
        select: {
          displayName: true,
          phoneNumber: true,
          email: true,
        },
      },
    },
  })

  return bookings
}

// Mark passenger as boarded
const markPassengerBoarded = async (passengerId, staffId) => {
  // Check if passenger exists and staff is assigned
  const passenger = await prisma.passengerDetail.findUnique({
    where: { id: passengerId },
    include: {
      booking: {
        include: {
          trip: true,
        },
      },
    },
  })

  if (!passenger) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Passenger not found')
  }

  if (passenger.booking.trip.staffId !== staffId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not assigned to this trip')
  }

  if (passenger.isBoarded) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Passenger already boarded')
  }

  const updated = await prisma.passengerDetail.update({
    where: { id: passengerId },
    data: {
      isBoarded: true,
      boardedAt: new Date(),
    },
  })

  return updated
}

// Update trip status (departed/arrived)
const updateTripStatus = async (tripId, staffId, status) => {
  // Verify staff is assigned
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      staffId,
    },
  })

  if (!trip) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not assigned to this trip')
  }

  const updateData = { status }

  if (status === 'departed') {
    updateData.actualDeparture = new Date()
  } else if (status === 'arrived') {
    updateData.actualArrival = new Date()
  }

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: updateData,
  })

  return updated
}

export const staffService = {
  getAssignedTrips,
  getTripPassengers,
  markPassengerBoarded,
  updateTripStatus,
}
