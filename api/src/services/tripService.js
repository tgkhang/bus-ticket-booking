import { tripModel } from '~/models/tripModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { routeModel } from '~/models/routeModel'
import { busModel } from '~/models/busModel'

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
    const { GET_DB } = await import('~/config/prisma')
    const prisma = GET_DB()
    const route = await prisma.route.findUnique({
      where: { id: updateData.routeId },
    })
    if (!route) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Route not found')
    }
  }

  // If updating bus, validate it exists
  if (updateData.busId) {
    const { GET_DB } = await import('~/config/prisma')
    const prisma = GET_DB()
    const bus = await prisma.bus.findUnique({
      where: { id: updateData.busId },
    })
    if (!bus) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bus not found')
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

  // Check if trip has any confirmed bookings
  const { GET_DB } = await import('~/config/prisma')
  const prisma = GET_DB()
  const confirmedBookings = await prisma.booking.findFirst({
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

export const tripService = {
  searchTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  listTrips,
}
