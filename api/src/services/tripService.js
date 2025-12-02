import { tripModel } from '~/models/tripModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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
    amenities: query.amenities ? query.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
    status: query.status,
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

export const tripService = { searchTrips, getTripById }
