import { tripModel } from '~/models/tripModel'

const searchTrips = async (query) => {
  // Prepare filters with defaults
  const filters = {
    originStopId: query.originStopId,
    destinationStopId: query.destinationStopId,
    date: query.date,
    timeFrom: query.timeFrom,
    timeTo: query.timeTo,
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

export const tripService = { searchTrips }
