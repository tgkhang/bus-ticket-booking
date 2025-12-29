import { tripModel } from '~/models/tripModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { routeModel } from '~/models/routeModel'
import { busModel } from '~/models/busModel'
import { GET_DB } from '~/config/prisma'

const searchTrips = async (query) => {
  // Prepare filters with defaults
  const filters = {
    originStopId: query.originStopId,
    destinationStopId: query.destinationStopId,
    date: query.date,
    timeFrom: query.timeFrom || query.startTime,
    timeTo: query.timeTo || query.endTime,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    busModel: query.busModel,
    busType: query.busType
      ? (Array.isArray(query.busType) ? query.busType : query.busType.split(',')).map((s) => s.trim()).filter(Boolean)
      : [],
    amenities: query.amenities
      ? query.amenities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    status: query.status,
    passengers: query.passengers ? Number(query.passengers) : 1,
    page: Number(query.page),
    limit: Number(query.limit),
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  }
  return tripModel.searchTrips(filters)
}

const getTripById = async (id) => {
  const trip = await tripModel.getTripById(id)
  if (!trip) throw new ApiError(StatusCodes.NOT_FOUND, 'Trip not found')
  return trip
}

const createTrip = async (tripData, userRole, userOperatorId) => {
  // Validate that route exists
  const route = routeModel.findById(tripData.routeId)
  if (!route) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Route not found')
  }

  // Validate that bus exists
  const bus = busModel.findBusById(tripData.busId)
  if (!bus) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bus not found')
  }

  // Check if bus is available for this time slot
  const conflictingTrip = await busModel.validateBusAvailability(
    tripData.busId,
    tripData.departureTime,
    tripData.arrivalTime
  )

  if (!conflictingTrip) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bus is already scheduled for an overlapping time period')
  }

  return await tripModel.createTrip(tripData)
}

const listTrips = async (filters = {}, pagination = {}) => {
  return await tripModel.listTrips(filters, pagination)
}

const updateTrip = async (id, updateData) => {
  // Check if trip exists
  const existingTrip = await tripModel.getTripById(id)
  if (!existingTrip) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Trip not found')
  }

  // If updating route, validate it exists
  if (updateData.routeId) {
    const route = await GET_DB().route.findUnique({
      where: { id: updateData.routeId },
    })
    if (!route) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Route not found')
    }
  }

  // If updating bus, validate it exists
  if (updateData.busId) {
    const bus = await GET_DB().bus.findUnique({
      where: { id: updateData.busId },
    })
    if (!bus) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bus not found')
    }
  }

  // If assigning staff, validate staff exists
  if (updateData.staffId) {
    const staff = await GET_DB().staff.findUnique({
      where: { id: updateData.staffId },
    })
    if (!staff) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Staff not found')
    }
  }

  // Validate that trip can only be set to active if staff is assigned
  if (updateData.status === 'active') {
    const finalStaffId = updateData.staffId !== undefined ? updateData.staffId : existingTrip.staffId
    if (!finalStaffId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot set trip to active without assigning a staff member')
    }
  }

  return await tripModel.updateTrip(id, updateData)
}

const deleteTrip = async (id) => {
  // Check if trip exists
  const trip = await tripModel.getTripById(id)
  if (!trip) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Trip not found')
  }

  const confirmedBookings = await GET_DB().booking.findFirst({
    where: {
      tripId: id,
      status: { in: ['confirmed', 'pending'] },
    },
  })

  if (confirmedBookings) {
    throw new ApiError(StatusCodes.CONFLICT, 'Cannot delete trip with confirmed or pending bookings')
  }

  return await tripModel.deleteTrip(id)
}

const cancelScheduledTrip = async (id) => {
  const prisma = GET_DB()

  const trip = await prisma.trip.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      departureTime: true,
    },
  })

  if (!trip) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Trip not found')
  }

  if (String(trip.status).toLowerCase() !== 'scheduled') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Only scheduled trips can be cancelled')
  }

  // Prevent cancelling trips that have already started
  if (trip.departureTime && new Date() >= new Date(trip.departureTime)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot cancel a trip after its departure time')
  }

  await prisma.$transaction(async (tx) => {
    // 1) Cancel the trip
    await tx.trip.update({
      where: { id },
      data: { status: 'cancelled' },
    })

    // 2) Cancel all bookings for the trip (pending/confirmed)
    await tx.booking.updateMany({
      where: {
        tripId: id,
        status: { in: ['pending', 'confirmed'] },
      },
      data: { status: 'cancelled' },
    })

    // 3) Release all seats for this trip
    await tx.seatStatus.updateMany({
      where: {
        tripId: id,
        status: { in: ['locked', 'booked'] },
      },
      data: {
        status: 'available',
        lockedUntil: null,
      },
    })
  })

  return { success: true, message: 'Trip cancelled and all bookings were cancelled' }
}

export const tripService = {
  searchTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  listTrips,
  cancelScheduledTrip,
}
